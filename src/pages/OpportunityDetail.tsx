import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, MapPin, Users, Heart, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOpp(data.data);
        setLoading(false);
      });
  }, [id]);

  const handleSignUp = async () => {
    if (!user) {
      await signIn();
      return;
    }
    setSigningUp(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/opportunities/${id}/signup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
         setSignedUp(true);
      } else {
         alert(data.error || 'Failed to sign up');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSigningUp(false);
    }
  };

  if (loading || !opp) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Sparkles className="animate-spin text-sage" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="h-64 md:h-96 relative w-full overflow-hidden">
        {opp.cause?.imageUrl && (
          <img src={opp.cause.imageUrl} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
        <div className="absolute top-8 left-8">
          <Link to="/discover" className="inline-flex items-center space-x-2 text-white bg-navy/30 hover:bg-navy/50 backdrop-blur-md px-4 py-2 rounded-full transition-colors">
            <ArrowLeft size={18} />
            <span>Back to Discover</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-10 -mt-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-navy/5"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-6">
                {opp.nonprofit?.logoUrl && (
                   <img src={opp.nonprofit.logoUrl} className="w-12 h-12 rounded-full shadow-sm" />
                )}
                <div>
                  <h3 className="text-[12px] uppercase tracking-[1px] font-semibold text-navy">{opp.nonprofit?.name}</h3>
                  <div className="text-[10px] uppercase tracking-[1px] text-sage font-bold mt-1 bg-sage/10 px-2 py-0.5 rounded-full w-fit">{opp.cause?.name}</div>
                </div>
              </div>
              <h1 className="text-[40px] md:text-[56px] font-heading text-navy mb-4 leading-[1.1]">{opp.title}</h1>
            </div>

            <div className="flex-shrink-0 flex gap-3">
              <button className="w-12 h-12 rounded-full border border-navy/10 flex items-center justify-center text-navy/60 hover:text-coral hover:bg-coral/5 transition-colors">
                <Heart size={20} />
              </button>
              <button className="w-12 h-12 rounded-full border border-navy/10 flex items-center justify-center text-navy/60 hover:text-navy hover:bg-navy/5 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 py-8 border-y border-navy/5">
            <div className="flex items-center space-x-3">
              <div className="bg-sage/10 p-3 rounded-xl text-sage">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[1px] font-semibold text-navy/40">Date</div>
                <div className="font-semibold text-navy">{new Date(opp.dateStart).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-coral/10 p-3 rounded-xl text-coral">
                <MapPin size={24} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[1px] font-semibold text-navy/40">Location</div>
                <div className="font-semibold capitalize text-navy">{opp.locationType}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-navy/10 p-3 rounded-xl text-navy">
                <Users size={24} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[1px] font-semibold text-navy/40">Availability</div>
                <div className="font-semibold text-navy">{opp.spotsAvailable} spots left</div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg prose-navy max-w-none mb-12">
            <h3 className="font-heading text-[24px] mb-4">About this opportunity</h3>
            <p className="text-navy/80 leading-[1.6] text-[16px]">{opp.description}</p>
          </div>

          <div className="bg-cream rounded-[24px] p-10 flex flex-col items-center text-center">
            {signedUp ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="bg-sage/20 p-4 rounded-full mb-4 text-sage">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-[28px] font-heading text-navy mb-2">You're signed up!</h3>
                <p className="text-[14px] text-navy/70 mb-6">We've added this to your impact dashboard. Check your email for next steps.</p>
                <Link to="/impact" className="text-[12px] uppercase tracking-[1px] font-bold text-sage hover:text-navy transition-colors">View my Impact</Link>
              </motion.div>
            ) : (
              <>
                <h3 className="text-[28px] font-heading text-navy mb-2">Ready to make an impact?</h3>
                <p className="text-[14px] text-navy/70 mb-8">Join {opp.nonprofit?.name} and help build a better tomorrow.</p>
                <button 
                  onClick={handleSignUp}
                  disabled={signingUp}
                  className="bg-navy text-cream px-8 py-4 text-[14px] uppercase tracking-[1px] font-semibold rounded-full hover:bg-navy/90 transition-all active:scale-95 disabled:opacity-70 flex items-center space-x-2 border-none"
                >
                  {signingUp ? <Sparkles className="animate-spin" size={20} /> : <Heart size={20} />}
                  <span>{user ? 'Sign Up Now' : 'Sign In to Apply'}</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
