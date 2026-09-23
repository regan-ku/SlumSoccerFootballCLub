"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Footer() {
  const [orgData, setOrgData] = useState({
    name: 'Slum Stars FC',
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
        .select('name, mpesa_paybill_number, mpesa_account_name, contact_email, contact_phone')
        .limit(1)
        .single();
      
      if (data) {
        setOrgData({
          name: data.name || 'Slum Stars FC',
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
            <h3 className="font-heading text-2xl font-bold uppercase tracking-wider mb-4">
              {orgData.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering the next generation through football, life skills, and community development.
            </p>
          </div>

          {/* M-Pesa Donation Info */}
          <div className="md:col-span-1">
            <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-4 text-accent">
              Support Us
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>M-Pesa Paybill:</p>
              <p className="text-foreground font-bold text-lg">{orgData.mpesa_paybill_number}</p>
              <p>Account Name:</p>
              <p className="text-foreground font-medium">{orgData.mpesa_account_name}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/teams" className="hover:text-foreground transition-colors">Our Teams</Link></li>
              <li><Link href="/leagues" className="hover:text-foreground transition-colors">League Tables</Link></li>
              <li><Link href="/programs" className="hover:text-foreground transition-colors">Programs</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: <span className="text-foreground">{orgData.contact_email}</span></li>
              <li>Phone: <span className="text-foreground">{orgData.contact_phone}</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {orgData.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}