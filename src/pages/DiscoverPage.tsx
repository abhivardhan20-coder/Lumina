import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Calendar, Users, Sparkles, Filter, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  locationType: string;
  spotsAvailable: number;
  dateStart: string;
  matchScore?: number;
  matchReason?: string;
  cause: { name: string; category: string; imageUrl: string };
  nonprofit: { name: string; logoUrl: string };
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommended, setRecommended] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
       try {
          const res = await fetch('/api/opportunities');
          const data = await res.json();
          if (data.success) {
             setOpportunities(data.data);
          }

          if (user) {
             const token = await user.getIdToken();
             const recRes = await fetch('/api/opportunities/recommended', {
                headers: { Authorization: `Bearer ${token}` }
             });
             const recData = await recRes.json();
             if (recData.success) {
                setRecommended(recData.data);
             }
          }
       } catch (error) {
          console.error(error);
       } finally {
          setLoading(false);
       }
    };
    fetchData();
  }, [user]);

  const filteredOpps = opportunities.filter(opp => 
     opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     opp.cause?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Sparkles className="animate-spin text-sage" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-12">
      <div className="mb-12">
        <h1 className="text-[48px] font-heading font-normal text-navy mb-2 italic">Discover Opportunities</h1>
        <p className="text-[18px] text-navy/70 max-w-2xl text-balance">Find where your passion meets the world's needs. Explore personalized matching and create impact.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
         <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/40" size={20} />
            <input 
               type="text" 
               placeholder="Search by keyword or cause..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white border border-navy/10 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-sage/50 text-[16px]"
            />
         </div>
         <button className="bg-white border border-navy/10 rounded-full px-8 py-4 flex items-center gap-2 hover:bg-navy/5 transition-colors font-semibold uppercase tracking-[1px] text-[12px] text-navy">
            <Filter size={16} /> Filters
         </button>
      </div>

      {user && recommended.length === 0 && searchQuery === '' && !loading && (
         <div className="mb-12 bg-sage/10 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-sage/20">
            <div>
               <h3 className="font-heading text-[24px] text-navy mb-1">Unlock AI Matches</h3>
               <p className="text-navy/70 text-[16px]">Update your profile with your skills to see personalized opportunity recommendations.</p>
            </div>
            <Link to="/profile" className="mt-4 md:mt-0 flex-shrink-0 bg-sage text-white px-8 py-4 text-[14px] uppercase tracking-[1px] font-semibold rounded-full hover:bg-sage/90 transition-all border-none">
               Complete Profile
            </Link>
         </div>
      )}

      {user && recommended.length > 0 && searchQuery === '' && (
         <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
               <Sparkles className="text-sage" size={24} />
               <h2 className="text-[28px] font-heading text-navy">Recommended for you</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {recommended.map((opp, idx) => (
               <motion.div 
                  key={`rec-${opp.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-[24px] overflow-hidden transition-all duration-300 border-[2px] border-sage/20 flex flex-col hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] relative"
               >
                  <div className="absolute top-4 right-4 z-10 bg-sage text-white text-[10px] uppercase font-bold tracking-[1px] px-3 py-1.5 rounded-full shadow-sm">
                     {opp.matchScore}% Match
                  </div>
                  <Link to={`/opportunity/${opp.id}`} className="block relative h-48 overflow-hidden bg-navy/5">
                     {opp.cause?.imageUrl && (
                     <img 
                        src={opp.cause.imageUrl} 
                        alt={opp.cause.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                     )}
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-navy text-[10px] uppercase font-bold tracking-[1px] px-3 py-1.5 rounded-full shadow-sm">
                     {opp.cause?.name}
                     </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                     <div className="text-[12px] uppercase tracking-[1px] text-sage font-semibold mb-2">
                     {opp.nonprofit?.name}
                     </div>

                     <h2 className="text-[20px] font-heading text-navy mb-2 line-clamp-2 leading-snug group-hover:text-sage transition-colors">
                     <Link to={`/opportunity/${opp.id}`}>{opp.title}</Link>
                     </h2>
                     <div className="bg-sage/5 p-3 rounded-[12px] mb-4">
                        <p className="text-sage text-[13px] leading-[1.5] font-medium">✨ {opp.matchReason}</p>
                     </div>

                     <div className="mt-auto pt-4 border-t border-navy/5 grid grid-cols-2 gap-y-3">
                     <div className="flex items-center text-[12px] font-bold text-navy/70">
                        <MapPin size={14} className="mr-1.5 text-coral" />
                        <span className="capitalize">{opp.locationType}</span>
                     </div>
                     <div className="flex items-center text-[12px] font-bold text-navy/70">
                        <Calendar size={14} className="mr-1.5 text-sage" />
                        <span>{new Date(opp.dateStart).toLocaleDateString()}</span>
                     </div>
                     </div>
                  </div>
               </motion.div>
               ))}
            </div>
         </div>
      )}

      <h2 className="text-[28px] font-heading text-navy mb-6">All Openings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOpps.map((opp, idx) => (
          <motion.div 
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-[24px] overflow-hidden transition-all duration-300 border border-navy/5 flex flex-col hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
          >
            <Link to={`/opportunity/${opp.id}`} className="block relative h-48 overflow-hidden bg-navy/5">
              {opp.cause?.imageUrl && (
                <img 
                  src={opp.cause.imageUrl} 
                  alt={opp.cause.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-navy text-[10px] uppercase font-bold tracking-[1px] px-3 py-1.5 rounded-full shadow-sm">
                {opp.cause?.name}
              </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
              <div className="text-[12px] uppercase tracking-[1px] text-sage font-semibold mb-2">
                {opp.nonprofit?.name}
              </div>

              <h2 className="text-[20px] font-heading text-navy mb-2 line-clamp-2 leading-snug group-hover:text-sage transition-colors">
                <Link to={`/opportunity/${opp.id}`}>{opp.title}</Link>
              </h2>
              <p className="text-navy/60 text-[14px] mb-6 line-clamp-2 leading-[1.5]">
                {opp.description}
              </p>

              <div className="mt-auto pt-4 border-t border-navy/5 grid grid-cols-2 gap-y-3">
                <div className="flex items-center text-[12px] font-bold text-navy/70">
                  <MapPin size={14} className="mr-1.5 text-coral" />
                  <span className="capitalize">{opp.locationType}</span>
                </div>
                <div className="flex items-center text-[12px] font-bold text-navy/70">
                  <Calendar size={14} className="mr-1.5 text-sage" />
                  <span>{new Date(opp.dateStart).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-[12px] font-bold text-navy/70 col-span-2">
                  <Users size={14} className="mr-1.5 text-navy" />
                  <span>{opp.spotsAvailable} spots available</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredOpps.length === 0 && !loading && (
         <div className="text-center py-20 bg-white rounded-[24px] border border-navy/5">
            <Search className="mx-auto text-navy/20 mb-4" size={48} />
            <h3 className="text-[24px] font-heading text-navy mb-2">No opportunities found</h3>
            <p className="text-navy/60">Try adjusting your search terms.</p>
         </div>
      )}
    </div>
  );
}

