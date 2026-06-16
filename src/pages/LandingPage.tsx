import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, LineChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-10">
      <section className="flex flex-col md:flex-row relative pt-16 pb-20 gap-10 min-h-[360px]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="inline-flex items-center space-x-2 bg-sage/10 text-sage px-4 py-2 rounded-full font-medium text-[10px] uppercase tracking-[1px] mb-6 w-fit">
            <SparklesIcon size={14} />
            <span>Premium Volunteer Network</span>
          </div>
          <h1 className="font-heading text-[72px] leading-[0.95] mb-6 font-normal italic text-navy">
            Turn passion<br className="hidden md:block"/> into impact.
          </h1>
          <p className="text-[18px] leading-[1.6] max-w-[400px] opacity-80 text-navy mb-8">
            Intelligent matching for modern philanthropists. Discover where your skills meet the world's greatest needs.
          </p>
          <div>
            <Link to="/discover" className="inline-flex items-center border-none bg-navy text-cream px-8 py-4 text-[14px] uppercase tracking-[1px] font-semibold rounded-full hover:bg-navy/90 transition-all w-fit">
              Start Your Journey
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:block w-[440px] rounded-[120px_0_120px_120px] relative overflow-hidden -rotate-2 shadow-[40px_40px_80px_rgba(0,0,0,0.05)]"
        >
          <div className="w-full h-full bg-gradient-to-br from-sage to-navy flex items-center justify-center text-white rotate-2 p-8 text-center min-h-[360px]">
             <div>
                <div className="text-[12px] uppercase tracking-[4px] mb-2 font-medium">Featured Impact</div>
                <div className="font-heading text-[32px] leading-snug">The Lumina<br/>Global Initiative</div>
             </div>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        <div className="col-span-1 rounded-[24px] p-6 relative flex flex-col min-h-[328px] bg-[#e9ecef]">
          <div className="text-[12px] uppercase tracking-[1px] text-sage font-semibold mb-4">
             Recommended for you <span className="bg-sage text-white px-2.5 py-1 rounded-full text-[10px] inline-block ml-2 w-fit">98% AI Match</span>
          </div>
          <h3 className="font-heading text-[20px] mb-2 text-navy">Ocean Sentinel Project</h3>
          <p className="text-[14px] leading-[1.5] opacity-70 text-navy">Use your data analysis skills to track microplastic patterns in the Pacific Northwest.</p>
          <div className="mt-auto pt-4 flex items-center gap-3">
             <div className="text-[12px] font-bold text-navy">Apply by Oct 24</div>
          </div>
        </div>

        <div className="col-span-1 border border-navy/5 rounded-[24px] p-6 relative flex flex-col min-h-[328px] bg-white">
          <div className="text-[12px] uppercase tracking-[1px] text-sage font-semibold mb-2">Your Impact Dashboard</div>
          <div className="grid grid-cols-2 gap-5 mt-4">
            <div>
               <div className="font-heading text-[48px] text-coral leading-none">142</div>
               <div className="text-[13px] opacity-60 mt-1">Hours Logged</div>
            </div>
            <div>
               <div className="font-heading text-[48px] text-coral leading-none">04</div>
               <div className="text-[13px] opacity-60 mt-1">Active Causes</div>
            </div>
            <div>
               <div className="font-heading text-[48px] text-coral leading-none">12k</div>
               <div className="text-[13px] opacity-60 mt-1">People Helped</div>
            </div>
            <div>
               <div className="font-heading text-[48px] text-coral leading-none">08</div>
               <div className="text-[13px] opacity-60 mt-1">Impact Streak</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-sage text-white rounded-[24px] p-6 relative flex flex-col min-h-[328px]">
          <div className="text-[12px] uppercase tracking-[1px] text-white/70 font-semibold mb-4">Community Milestone</div>
          <h3 className="font-heading text-[24px] mb-4">Lumina Collective just reached 1M trees planted.</h3>
          <p className="text-[14px] opacity-90 mb-6">You contributed 45 hours to this collective goal. See the difference your hours made.</p>
          <div className="mt-auto h-[80px] w-full bg-white/10 rounded-[12px] flex items-center justify-center">
             <span className="text-[11px] uppercase tracking-[2px]">View the story</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
