import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { db } from './src/db/index.ts';
import { profiles, opportunities, causes, nonprofits, volunteerSignups, userImpact } from './src/db/schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { GoogleGenAI, Type } from '@google/genai';
import { ProfileUpdateSchema } from './src/types/api.ts';
import rateLimit from 'express-rate-limit';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use('/api/', apiLimiter);

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  app.get('/api/opportunities', async (req, res) => {
    try {
      const results = await db.query.opportunities.findMany({
        with: {
          nonprofit: true,
          cause: true,
        },
        orderBy: [desc(opportunities.createdAt)],
      });
      res.json({ success: true, data: results });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Failed to fetch opportunities' });
    }
  });

  app.get('/api/opportunities/recommended', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const userProfileResult = await db.select().from(profiles).where(eq(profiles.id, uid));
      const userProfile = userProfileResult[0];

      if (!userProfile || (!userProfile.skills && !userProfile.values)) {
         // Return latest if not enough profile data
         const results = await db.query.opportunities.findMany({
            with: { nonprofit: true, cause: true },
            orderBy: [desc(opportunities.createdAt)],
            limit: 3
         });
         return res.json({ success: true, data: results });
      }

      // Fetch all open opportunities
      const allOpps = await db.query.opportunities.findMany({
         where: eq(opportunities.status, 'open'),
         with: { nonprofit: true, cause: true },
         limit: 20
      });

      // Avoid AI matching if empty list
      if (allOpps.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Use Gemini to match opportunities
      const prompt = `
      User Profile:
      Skills: ${JSON.stringify(userProfile.skills || [])}
      Values/Causes: ${JSON.stringify(userProfile.values || [])}
      Bio: ${userProfile.bio || ''}

      Available Opportunities:
      ${allOpps.map(o => `ID: ${o.id} | Title: ${o.title} | Cause: ${o.cause?.name} | Skills Required: ${JSON.stringify(o.skillsRequired || [])} | Desc: ${o.description}`).join('\n')}

      Task: Select the top 3 best matching opportunities for this user based on their skills and values.
      Return the results as a JSON array.
      `;

      try {
        const response = await ai.models.generateContent({
           model: 'gemini-3.5-flash',
           contents: prompt,
           config: {
              responseMimeType: 'application/json',
              responseSchema: {
                 type: Type.ARRAY,
                 items: {
                    type: Type.OBJECT,
                    properties: {
                       opportunityId: { type: Type.STRING },
                       matchScore: { type: Type.INTEGER, description: 'Score from 0-100 indicating percentage match' },
                       matchReason: { type: Type.STRING, description: 'Short 1 sentence reason why this is a good match' }
                    },
                    required: ['opportunityId', 'matchScore', 'matchReason']
                 }
              }
           }
        });

        const parsedRecs = JSON.parse(response.text.trim());
        const enrichedRecs = parsedRecs.map((rec: any) => {
           const opp = allOpps.find((o: any) => o.id === rec.opportunityId);
           return { ...opp, matchScore: rec.matchScore, matchReason: rec.matchReason };
        }).filter((o: any) => o.id); // ensure valid ID

        res.json({ success: true, data: enrichedRecs.slice(0, 3) });
      } catch (geminiError) {
         console.error('Gemini matching failed', geminiError);
         // Fallback
         res.json({ success: true, data: allOpps.slice(0, 3) });
      }

    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const results = await db.query.opportunities.findFirst({
        where: eq(opportunities.id, req.params.id),
        with: {
          nonprofit: true,
          cause: true,
        }
      });
      if (!results) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
      res.json({ success: true, data: results });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Failed to fetch opportunity' });
    }
  });

  app.post('/api/opportunities/:id/signup', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      const { id } = req.params;
      
      // Upsert user profile first if it doesn't exist
      const userProfile = await db.select().from(profiles).where(eq(profiles.id, uid));
      if (userProfile.length === 0) {
        await db.insert(profiles).values({
          id: uid,
          fullName: req.user?.name || '',
          avatarUrl: req.user?.picture || '',
        });
      }

      // Check if already signed up
      const existingSignup = await db.select().from(volunteerSignups).where(
         and(eq(volunteerSignups.userId, uid), eq(volunteerSignups.opportunityId, id))
      );

      if (existingSignup.length > 0) {
         return res.status(400).json({ success: false, error: 'Already signed up for this opportunity' });
      }

      await db.insert(volunteerSignups).values({
        userId: uid,
        opportunityId: id as string,
        status: 'pending'
      });

      // Update basic impact metrics (create impact row if needed)
      const existingImpact = await db.select().from(userImpact).where(eq(userImpact.userId, uid));
      if (existingImpact.length === 0) {
         await db.insert(userImpact).values({
            userId: uid,
            totalHours: 0,
            opportunitiesCompleted: 0,
            streakDays: 1,
            lastActivity: new Date()
         });
      } else {
         // Optionally update lastActivity or streak here
      }

      res.json({ success: true, data: { status: 'pending' } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Signup failed' });
    }
  });

  app.get('/api/dashboard', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });
      
      const mySignups = await db.query.volunteerSignups.findMany({
        where: eq(volunteerSignups.userId, uid),
        with: {
          opportunity: {
            with: { cause: true, nonprofit: true }
          }
        }
      });
      
      const impact = await db.query.userImpact.findFirst({
        where: eq(userImpact.userId, uid)
      });
      
      res.json({ success: true, data: { signups: mySignups, impact: impact || { totalHours: 0, streakDays: 0, opportunitiesCompleted: 0 } } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: 'Failed to load dashboard' });
    }
  });

  app.get('/api/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });

      const userProfile = await db.select().from(profiles).where(eq(profiles.id, uid));
      if (userProfile.length === 0) {
        // Create basic profile
        const newProfile = await db.insert(profiles).values({
          id: uid,
          fullName: req.user?.name || '',
          avatarUrl: req.user?.picture || '',
        }).returning();
        return res.json({ success: true, data: newProfile[0] });
      }

      res.json({ success: true, data: userProfile[0] });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.put('/api/profile', requireAuth, async (req: AuthRequest, res) => {
     try {
       const uid = req.user?.uid;
       if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });

       const parsed = ProfileUpdateSchema.safeParse(req.body);
       if (!parsed.success) {
          return res.status(400).json({ success: false, error: 'Invalid payload', data: parsed.error });
       }

       // Ensure user exists
       const userProfile = await db.select().from(profiles).where(eq(profiles.id, uid));
       if (userProfile.length === 0) {
          await db.insert(profiles).values({
            id: uid,
            fullName: req.user?.name || '',
            avatarUrl: req.user?.picture || '',
            ...parsed.data
          });
       } else {
          await db.update(profiles).set(parsed.data).where(eq(profiles.id, uid));
       }
       
       const updated = await db.select().from(profiles).where(eq(profiles.id, uid));
       res.json({ success: true, data: updated[0] });
     } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
     }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
