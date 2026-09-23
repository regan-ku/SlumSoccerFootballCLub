"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Footer() {
  const [orgData, setOrgData] = useState({
    name: 'Slum Stars FC',
    logo_url: '',
    mpesa_paybill_number: '000000',
    mpesa_account_name: 'Slum Stars',
    contact_email: 'info@slumstars.com',
    contact_phone: '+254 700 000 000'
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('organization')
        .select('name, logo_url, mpesa_paybill_number, mpesa_account_name, contact_email, contact_phone')
        .limit(1)
        .single();
      
      if (data) {
        setOrgData({
          name: data.name || 'Slum Stars FC',
          logo_url: data.logo_url || '',
          mpesa_paybill_number: data.mpesa_paybill_number || '000000',
          mpesa_account_name: data.mpesa_account_name || 'Slum Stars',
          contact_email: data.contact_email || 'info@slumstars.com',
          contact_phone: data.contact_phone || '+254 700 000 000'
        });
      }
    };
    fetchOrganization();
  }, []);

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="section-padding !px-4 md:!px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {orgData.logo_url ? (
                <img src={orgData.logo_url} alt="Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div className="h-12 w-12 bg-foreground rounded-sm flex items-center justify-center">
                  <span className="text-background font-heading font-bold text-2xl">S</span>
                </div>
              )}
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider">
                {orgData.name}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering the next generation through football, life skills, and community development.
            </p>
          </div>

          {/* M-Pesa Donation Info */}
          <div className="md:col-span-1">
            <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-4 text-accent">
              Support Us
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-wider mb-1">M-Pesa Paybill</p>
                <p className="text-foreground font-bold text-xl">{orgData.mpesa_paybill_number}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1">Account Name</p>
                <p className="text-foreground font-medium">{orgData.mpesa_account_name}</p>
              </div>
              <Link href="/donate" className="inline-block mt-2 text-xs font-bold uppercase text-accent hover:text-foreground transition-colors">
                Learn how to donate &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/teams" className="hover:text-accent transition-colors">Our Teams</Link></li>
              <li><Link href="/leagues" className="hover:text-accent transition-colors">League Tables</Link></li>
              <li><Link href="/programs" className="hover:text-accent transition-colors">Programs</Link></li>
              <li><Link href="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex flex-col">
                <span className="text-xs uppercase tracking-wider mb-1">Email</span>
                <a href={`mailto:${orgData.contact_email}`} className="text-foreground hover:text-accent transition-colors">{orgData.contact_email}</a>
              </li>
              <li className="flex flex-col">
                <span className="text-xs uppercase tracking-wider mb-1">Phone / WhatsApp</span>
                <a href={`https://wa.me/${orgData.contact_phone.replace(/\D/g, '')}`} className="text-foreground hover:text-accent transition-colors">{orgData.contact_phone}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {orgData.name}. All rights reserved. Built with pride for the community.
        </div>
      </div>
    </footer>
  );
}