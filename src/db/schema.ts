import { relations } from 'drizzle-orm';
import { jsonb, pgTable, serial, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  skills: jsonb('skills').default('[]'),
  values: jsonb('values').default('[]'),
  availability: jsonb('availability'),
  impactScore: integer('impact_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const nonprofits = pgTable('nonprofits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logoUrl: text('logo_url'),
  description: text('description'),
  website: text('website'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const causes = pgTable('causes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: text('category'),
  description: text('description'),
  imageUrl: text('image_url'),
});

export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  nonprofitId: uuid('nonprofit_id').references(() => nonprofits.id),
  title: text('title').notNull(),
  description: text('description'),
  causeId: uuid('cause_id').references(() => causes.id),
  skillsRequired: jsonb('skills_required'),
  dateStart: timestamp('date_start'),
  dateEnd: timestamp('date_end'),
  locationType: text('location_type'),
  spotsAvailable: integer('spots_available'),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const volunteerSignups = pgTable('volunteer_signups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => profiles.id),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id),
  status: text('status').default('pending'),
  hoursLogged: integer('hours_logged').default(0),
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const impactStories = pgTable('impact_stories', {
  id: uuid('id').primaryKey().defaultRandom(),
  nonprofitId: uuid('nonprofit_id').references(() => nonprofits.id),
  title: text('title'),
  content: text('content'),
  imageUrl: text('image_url'),
  impactMetrics: jsonb('impact_metrics'),
  publishedAt: timestamp('published_at'),
});

export const userImpact = pgTable('user_impact', {
  userId: text('user_id').primaryKey().references(() => profiles.id),
  totalHours: integer('total_hours').default(0),
  opportunitiesCompleted: integer('opportunities_completed').default(0),
  streakDays: integer('streak_days').default(0),
  lastActivity: timestamp('last_activity'),
});

// Relations
export const profilesRelations = relations(profiles, ({ many, one }) => ({
  signups: many(volunteerSignups),
  impact: one(userImpact, {
    fields: [profiles.id],
    references: [userImpact.userId],
  }),
}));

export const nonprofitsRelations = relations(nonprofits, ({ many }) => ({
  opportunities: many(opportunities),
  impactStories: many(impactStories),
}));

export const causesRelations = relations(causes, ({ many }) => ({
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  nonprofit: one(nonprofits, {
    fields: [opportunities.nonprofitId],
    references: [nonprofits.id],
  }),
  cause: one(causes, {
    fields: [opportunities.causeId],
    references: [causes.id],
  }),
  signups: many(volunteerSignups),
}));

export const volunteerSignupsRelations = relations(volunteerSignups, ({ one }) => ({
  user: one(profiles, {
    fields: [volunteerSignups.userId],
    references: [profiles.id],
  }),
  opportunity: one(opportunities, {
    fields: [volunteerSignups.opportunityId],
    references: [opportunities.id],
  }),
}));

export const impactStoriesRelations = relations(impactStories, ({ one }) => ({
  nonprofit: one(nonprofits, {
    fields: [impactStories.nonprofitId],
    references: [nonprofits.id],
  }),
}));
