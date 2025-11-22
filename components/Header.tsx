"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-2 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.02]">
      <div className="pl-4 pr-2 text-xl font-bold tracking-tighter text-foreground">
        <Link href="/">
          SF.
        </Link>
      </div>
      
      <nav className="flex items-center gap-1" onMouseLeave={() => setHoveredLink(null)}>
        {['About', 'Work', 'Contact'].map((item) => (
          <Link 
            key={item}
            href="#" 
            className="relative px-4 py-2 text-sm font-medium text-foreground/70 transition-colors duration-300 hover:text-foreground"
            onMouseEnter={() => setHoveredLink(item)}
          >
            <span className="relative z-10">{item}</span>
            {hoveredLink === item && (
              <motion.span
                layoutId="nav-background"
                className="absolute inset-0 bg-foreground/10 rounded-full -z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        ))}
        
        <div className="w-px h-6 bg-foreground/10 mx-2" />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground/70 hover:text-foreground"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>
      </nav>
    </header>
  );
}
