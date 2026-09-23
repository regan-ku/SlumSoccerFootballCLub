"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SearchModal from "@/components/ui/SearchModal";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const [orgData, setOrgData] = useState({ name: 'Slum Stars FC', logo_url: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('organization').select('name, logo_url').limit(1).single();
      if (data) {
        setOrgData({ name: data.name || 'Slum Stars FC', logo_url: data.logo_url || '' });
      }
    };
    fetchOrganization();
  }, []);

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

  // 1. PRIMARY LINKS (Visible on desktop - Swapped Leagues to here)
  const primaryLinks = [
    { name: 'Home', href: '/' },
    { name: 'Teams', href: '/teams' },
    { name: 'Leagues', href: '/leagues' }, 
    { name: 'Programs', href: '/programs' },
    { name: 'About', href: '/about' },
  ];

  // 2. SECONDARY LINKS (Grouped in "More" dropdown - Swapped Competitions to here)
  const moreLinks = [
    { name: 'Players', href: '/players' },
    { name: 'Competitions', href: '/competitions' },
    { name: 'Gallery', href: '/gallery' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="section-padding flex h-20 items-center justify-between !px-4 md:!px-8">
        
        {/* 1. Logo (Prevent shrinking, dedicated space) */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0 mr-4 md:mr-8">
          {orgData.logo_url ? (
            <img src={orgData.logo_url} alt={`${orgData.name} Logo`} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          ) : (
            <div className="h-10 w-10 bg-foreground rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-background font-heading font-bold text-xl">S</span>
            </div>
          )}
          <span className="font-heading text-xl font-bold uppercase tracking-wider text-foreground hidden md:block">
            {orgData.name}
          </span>
        </Link>

        {/* 2. Desktop Navigation (Clean, spaced out, max 5 items + dropdown) */}
        <nav className="hidden xl:flex items-center gap-8 flex-1">
          {primaryLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent uppercase tracking-wide whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}

          {/* "More" Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-accent uppercase tracking-wide whitespace-nowrap py-2">
              More <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
              <div className="py-2">
                {moreLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* 3. Right Side Actions (Dedicated spacing, separated from nav) */}
        <div className="flex items-center gap-3 md:gap-4 ml-auto md:ml-8">
          {/* Search Trigger Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-sm text-sm text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline font-medium">Search</span>
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-sans bg-background border border-border rounded">Ctrl K</kbd>
          </button>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Call to Action Button */}
          <Link href="/donate" className="btn-primary text-sm hidden sm:inline-flex whitespace-nowrap">
            Support Us
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="xl:hidden text-foreground p-2 ml-2" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Navigation Dropdown (Shows ALL links for accessibility) */}
      {isOpen && (
        <div className="xl:hidden border-t border-border bg-background px-4 py-6 space-y-2 animate-fade-in-up max-h-[80vh] overflow-y-auto">
          {[...primaryLinks, ...moreLinks].map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="block text-base font-medium text-foreground uppercase tracking-wide hover:text-accent transition-colors py-3 border-b border-border/50"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Actions */}
          <div className="pt-6 flex flex-col gap-4">
             <Link href="/donate" className="btn-primary w-full text-center" onClick={() => setIsOpen(false)}>
                Support Us
             </Link>
             <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
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