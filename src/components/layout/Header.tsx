"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SearchModal from "@/components/ui/SearchModal";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const [orgData, setOrgData] = useState({
    name: 'Slum Stars FC',
    logo_url: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('organization').select('name, logo_url').limit(1).single();
      
      if (data) {
        setOrgData({
          name: data.name || 'Slum Stars FC',
          logo_url: data.logo_url || ''
        });
      }
    };
    fetchOrganization();
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Players', href: '/players' }, // <-- ADDED PLAYERS
    { name: 'Teams', href: '/teams' },
    { name: 'Leagues', href: '/leagues' },
    { name: 'Competitions', href: '/competitions' },
    { name: 'Programs', href: '/programs' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="section-padding flex h-20 items-center justify-between !px-4 md:!px-8">
        
        {/* 1. Logo / Club Name (Prevent shrinking) */}
        <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
          {orgData.logo_url ? (
            <img 
              src={orgData.logo_url} 
              alt={`${orgData.name} Logo`} 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          ) : (
            <div className="h-10 w-10 bg-foreground rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-background font-heading font-bold text-xl">S</span>
            </div>
          )}
          <span className="font-heading text-xl font-bold uppercase tracking-wider text-foreground hidden sm:block">
            {orgData.name}
          </span>
        </Link>

        {/* 2. Desktop Navigation (Clean spacing, no wrapping) */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent uppercase tracking-wide whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. Right Side Actions (Neatly grouped) */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search Trigger Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-sm text-sm text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-sans bg-background border border-border rounded">Ctrl K</kbd>
          </button>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Call to Action Button */}
          <Link href="/donate" className="btn-primary text-sm hidden sm:inline-flex whitespace-nowrap">
            Support Us
          </Link>

          {/* Mobile Menu Button (Only shows when desktop nav is hidden) */}
          <button 
            className="xl:hidden text-foreground p-2" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="xl:hidden border-t border-border bg-background px-4 py-6 space-y-4 animate-fade-in-up">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="block text-lg font-medium text-foreground uppercase tracking-wide hover:text-accent transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Actions */}
          <div className="pt-6 border-t border-border flex flex-col gap-4">
             <Link 
                href="/donate" 
                className="btn-primary w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                Support Us
              </Link>
              <div className="flex items-center justify-center gap-4 pt-2">
                 <span className="text-sm text-muted-foreground">Theme:</span>
                 <ThemeToggle />
              </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}