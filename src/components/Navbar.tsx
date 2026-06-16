import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, signIn, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-navy/10">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ rotate: 15 }} className="bg-sage p-2 rounded-xl text-cream">
              <Sparkles size={24} />
            </motion.div>
            <span className="font-heading font-bold text-[28px] tracking-[-1px] text-navy">Lumina</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/discover" className="text-[14px] uppercase tracking-[1px] font-medium text-navy/60 hover:text-navy transition-colors pb-1">Discover</Link>
            {user && (
              <Link to="/impact" className="text-[14px] uppercase tracking-[1px] font-medium text-navy/60 hover:text-navy transition-colors pb-1 border-b-2 border-transparent hover:border-coral">My Impact</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-navy/80 hover:bg-navy/5 p-1 pr-3 rounded-full transition-colors">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-navy/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <span className="hidden md:block">{user.displayName?.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={signOut}
                  className="p-2 text-navy/50 hover:text-coral transition-colors rounded-full hover:bg-navy/5"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="bg-navy text-cream px-8 py-4 text-[14px] uppercase tracking-[1px] font-semibold rounded-full hover:bg-navy/90 transition-colors border-none"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
