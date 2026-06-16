import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
   const { user, loading: authLoading } = useAuth();
   const [profile, setProfile] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [success, setSuccess] = useState(false);

   // Form state
   const [skillsInput, setSkillsInput] = useState('');
   const [valuesInput, setValuesInput] = useState('');
   const [bio, setBio] = useState('');

   useEffect(() => {
      if (!user) return;
      user.getIdToken().then(token => {
         fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` }})
         .then(res => res.json())
         .then(data => {
            if (data.success && data.data) {
               setProfile(data.data);
               setSkillsInput((data.data.skills || []).join(', '));
               setValuesInput((data.data.values || []).join(', '));
               setBio(data.data.bio || '');
            }
            setLoading(false);
         });
      });
   }, [user]);

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      setSaving(true);
      setSuccess(false);

      const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
      const values = valuesInput.split(',').map(s => s.trim()).filter(s => s);

      try {
         const token = await user.getIdToken();
         const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ bio, skills, values })
         });
         const data = await res.json();
         if (data.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
         }
      } catch (e) {
         console.error(e);
      } finally {
         setSaving(false);
      }
   };

   if (authLoading) return null;
   if (!user) return <Navigate to="/" />;

   if (loading || !profile) {
      return (
         <div className="flex h-[calc(100vh-80px)] items-center justify-center">
         <Sparkles className="animate-spin text-sage" size={40} />
         </div>
      );
   }

   return (
      <div className="max-w-3xl mx-auto px-10 py-12">
         <div className="mb-12">
            <h1 className="text-[32px] font-heading text-navy flex items-center gap-3">
               <User size={32} /> Your Profile
            </h1>
            <p className="text-[16px] text-navy/70 mt-2 text-balance">
               Complete your profile to help us match you with the best opportunities.
               Our AI uses your skills and values to find your perfect cause.
            </p>
         </div>

         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] border border-navy/5 shadow-sm p-8">
            <form onSubmit={handleSave} className="space-y-6">
               <div>
                  <label className="block text-[12px] uppercase tracking-[1px] font-bold text-navy mb-2">Short Bio</label>
                  <textarea 
                     rows={3}
                     value={bio}
                     onChange={(e) => setBio(e.target.value)}
                     className="w-full border border-navy/10 rounded-[12px] p-4 text-[16px] text-navy focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                     placeholder="Tell organizations a bit about yourself..."
                  />
               </div>

               <div>
                  <label className="block text-[12px] uppercase tracking-[1px] font-bold text-navy mb-2">My Skills (comma separated)</label>
                  <input 
                     type="text"
                     value={skillsInput}
                     onChange={(e) => setSkillsInput(e.target.value)}
                     className="w-full border border-navy/10 rounded-[12px] p-4 text-[16px] text-navy focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                     placeholder="e.g. Graphic Design, Mentoring, Data Analysis"
                  />
               </div>

               <div>
                  <label className="block text-[12px] uppercase tracking-[1px] font-bold text-navy mb-2">Causes & Values (comma separated)</label>
                  <input 
                     type="text"
                     value={valuesInput}
                     onChange={(e) => setValuesInput(e.target.value)}
                     className="w-full border border-navy/10 rounded-[12px] p-4 text-[16px] text-navy focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                     placeholder="e.g. Environment, Education, Animal Welfare"
                  />
               </div>

               <div className="pt-4 flex items-center gap-4">
                  <button 
                     type="submit" 
                     disabled={saving}
                     className="bg-navy text-cream px-8 py-3 text-[14px] uppercase tracking-[1px] font-semibold rounded-full hover:bg-navy/90 transition-all active:scale-95 disabled:opacity-70 flex items-center space-x-2 border-none"
                  >
                     {saving ? <Sparkles className="animate-spin" size={18} /> : null}
                     <span>Save Profile</span>
                  </button>

                  {success && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-sage gap-2 text-[14px] font-semibold">
                        <CheckCircle2 size={18} /> Profile updated
                     </motion.div>
                  )}
               </div>
            </form>
         </motion.div>
      </div>
   );
}
