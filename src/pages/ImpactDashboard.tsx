import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, Award, Calendar, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function ImpactDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    user.getIdToken().then(token => {
      fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d.data);
        setLoading(false);
      });
    });
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/" />;

  if (loading || !data) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Sparkles className="animate-spin text-sage" size={40} />
      </div>
    );
  }

  const { impact, signups } = data;

  return (
    <div className="max-w-7xl mx-auto px-10 py-12">
      <div className="flex items-center space-x-4 mb-12">
        {user.photoURL && <img src={user.photoURL} alt="Avatar" className="w-[80px] h-[80px] object-cover rounded-full" />}
        <div>
          <h1 className="text-[32px] font-heading font-normal opacity-90 text-navy mb-1">Welcome back, {user.displayName?.split(' ')[0]}</h1>
          <p className="text-[14px] text-navy/70">Here's your impact so far.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} className="bg-white p-6 rounded-[24px] border border-navy/5 shadow-sm flex flex-col justify-center">
          <div className="text-[48px] font-heading text-coral leading-none mb-2">{impact.totalHours}</div>
          <div className="text-[12px] uppercase text-navy/60 font-semibold tracking-[1px]">Hours Logged</div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[24px] border border-navy/5 shadow-sm flex flex-col justify-center">
          <div className="text-[48px] font-heading text-coral leading-none mb-2">{impact.opportunitiesCompleted + signups.length}</div>
          <div className="text-[12px] uppercase text-navy/60 font-semibold tracking-[1px]">Missions Driven</div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[24px] border border-navy/5 shadow-sm flex flex-col justify-center">
          <div className="text-[48px] font-heading text-coral leading-none mb-2">12k</div>
          <div className="text-[12px] uppercase text-navy/60 font-semibold tracking-[1px]">People Helped</div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[24px] border border-navy/5 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Award size={100} />
          </div>
          <div className="text-[48px] font-heading text-coral leading-none mb-2">{impact.streakDays}</div>
          <div className="text-[12px] uppercase text-navy/60 font-semibold tracking-[1px]">Day Streak</div>
        </motion.div>
      </div>

      <h2 className="text-[28px] font-heading font-normal text-navy mb-6">Upcoming Commitments</h2>
      
      {signups.length === 0 ? (
        <div className="bg-white/50 border border-navy/5 rounded-[24px] p-12 text-center flex flex-col items-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Calendar className="text-navy/30" size={32} />
          </div>
          <h3 className="text-[20px] font-heading text-navy mb-2">Your calendar is clear</h3>
          <p className="text-[14px] text-navy/60 mb-6">Explore new opportunities and find your next mission.</p>
          <Link to="/discover" className="bg-navy text-cream px-8 py-4 text-[14px] uppercase tracking-[1px] font-semibold rounded-full hover:bg-navy/90 transition-colors border-none">
            Discover Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {signups.map((signup: any) => (
            <Link 
              key={signup.id} 
              to={`/opportunity/${signup.opportunityId}`}
              className="bg-white p-6 rounded-[24px] border border-navy/5 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group"
            >
              <div className="w-16 h-16 bg-navy/5 rounded-xl flex-shrink-0 relative overflow-hidden">
                {signup.opportunity?.cause?.imageUrl && (
                  <img src={signup.opportunity.cause.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[12px] uppercase font-semibold text-sage tracking-[1px] mb-1">{signup.opportunity?.nonprofit?.name}</div>
                <h3 className="text-[20px] font-heading text-navy">{signup.opportunity?.title}</h3>
                <div className="flex items-center text-[12px] text-navy/60 mt-2 space-x-4">
                  <div className="flex items-center space-x-1 font-bold">
                    <Calendar size={14} />
                    <span>{new Date(signup.opportunity?.dateStart).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-sage text-white px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[1px]">
                    {signup.status}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
