import React from 'react';
import { Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-[#262626] bg-[#080808] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <span className="font-display text-3xl font-black tracking-widest text-white uppercase">
              TOP <span className="bg-white text-black px-2 py-0.5 font-black text-2xl">STRONGMAN</span>
            </span>
          </div>

          <div className="text-center md:text-right text-xs text-zinc-400 font-mono uppercase">
            <p>DATA DERIVED FROM <a href="https://strongmanarchives.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-bold">STRONGMANARCHIVES.COM</a></p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#262626] flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 font-mono gap-2 uppercase">
          <p>© 2026 TOP STRONGMAN • ALL RIGHTS RESERVED</p>
          <p>
            DEVELOPED BY BRYCE YOUNG{' '}
            <a
              href="https://www.instagram.com/dubpred/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-bold"
            >
              @DUBPRED
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
