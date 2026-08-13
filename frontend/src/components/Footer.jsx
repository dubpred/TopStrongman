import React from 'react';
import { Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#1E293B] bg-[#0A0E17] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-dew-green" />
            <span className="font-display text-2xl font-bold tracking-wider text-dew-green">
              TOP <span className="text-white">STRONGMAN</span>
            </span>
          </div>

          <div className="text-center md:text-right text-xs text-gray-400 font-mono">
            <p>Data derived from <a href="https://strongmanarchives.com" target="_blank" rel="noopener noreferrer" className="text-dew-green hover:underline font-bold">StrongmanArchive.com</a></p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E293B]/60 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-mono gap-2">
          <p>© 2026 Top Strongman</p>
          <p>
            Made by Bryce Young{' '}
            <a
              href="https://www.instagram.com/dubpred/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dew-green hover:underline font-bold"
            >
              @Dubpred
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
