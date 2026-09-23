"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const [orgName, setOrgName] = useState('Slum Stars FC'); // Placeholder
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient();
      // Fetch the first row from the organization table
      const { data } = await supabase.from('organization').select('name').limit(1).single();
      
      // If data exists and has a name, update the state. Otherwise, keep placeholder.
      if (data?.name) {
        setOrgName(data.name);
      }
    };
    fetchOrganization();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Teams', href: '/teams' },
    { name: 'Leagues', href: '/leagues' },
    { name: 'Programs', href: '/programs' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="section-padding flex h-20 items-center justify-between !px-4 md:!px-8">
        {/* Logo / Club Name */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-foreground rounded-sm flex items-center justify-center">
            <span className="text-background font-heading font-bold text-xl">S</span>
          </div>
          <span className="font-heading text-xl font-bold uppercase tracking-wider text-foreground">
            {orgName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground uppercase tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Call to Action Button */}
        <div className="hidden md:block">
          <Link href="/donate" className="btn-primary text-sm">
            Support Us
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-6 space-y-4 animate-fade-in-up">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="block text-lg font-medium text-foreground uppercase tracking-wide"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/donate" 
            className="block w-full text-center btn-primary mt-4"
            onClick={() => setIsOpen(false)}
          >
            Support Us
          </Link>
        </div>
      )}
    </header>
  );
}