"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Heart, Shield, Users, Target, Copy, CheckCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
  const [orgData, setOrgData] = useState({
    name: 'Slum Stars FC',
    mpesa_paybill_number: '000000',
    mpesa_account_name: 'Slum Stars',
    contact_phone: '+254 700 000 000'
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('organization')
        .select('name, mpesa_paybill_number, mpesa_account_name, contact_phone')
        .limit(1)
        .single();
      
      if (data) {
        setOrgData({
          name: data.name || 'Slum Stars FC',
          mpesa_paybill_number: data.mpesa_paybill_number || '000000',
          mpesa_account_name: data.mpesa_account_name || 'Slum Stars',
          contact_phone: data.contact_phone || '+254 700 000 000'
        });
      }
    };
    fetchOrganization();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="section-padding relative z-10 text-center max-w-4xl mx-auto">
          <Heart className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-6">
            Support Our <span className="text-accent">Mission</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Your contribution directly funds football equipment, life skills workshops, and educational support for the next generation of community leaders.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="section-padding bg-background border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold uppercase text-center mb-12">
            Where Your <span className="text-accent">Money Goes</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="w-8 h-8 text-accent" />, title: "Youth Development", desc: "Providing boots, jerseys, and safe training facilities for over 100+ young athletes." },
              { icon: <Target className="w-8 h-8 text-accent" />, title: "Life Skills Programs", desc: "Funding mentorship, tutoring, and health awareness workshops beyond the pitch." },
              { icon: <Shield className="w-8 h-8 text-accent" />, title: "League Operations", desc: "Covering registration fees, transport, and referee costs for our competitive teams." }
            ].map((item, idx) => (
              <div key={idx} className="bg-card border border-border p-8 text-center hover:border-accent transition-colors">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-heading text-xl font-bold uppercase mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="section-padding bg-card">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold uppercase text-center mb-4">
            How to <span className="text-accent">Donate</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            The fastest and most secure way to support us is via M-Pesa. 
          </p>

          <div className="bg-background border border-border p-8 md:p-12 rounded-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <span className="text-green-500 font-heading font-bold text-xl">M</span>
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold uppercase">M-Pesa Paybill</h3>
                <p className="text-muted-foreground text-sm">Follow these simple steps to contribute</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 border border-border">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">1. Go to M-Pesa Menu</p>
                  <p className="text-foreground font-medium">Select <span className="text-accent font-bold">Lipa Na M-Pesa</span> then <span className="text-accent font-bold">Paybill</span></p>
                </div>
              </div>

              {/* Step 2: Paybill */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 border border-border">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">2. Enter Business Number</p>
                  <p className="text-foreground font-medium text-lg">{orgData.mpesa_paybill_number}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(orgData.mpesa_paybill_number)}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:border-accent text-sm font-bold uppercase transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Step 3: Account Name */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 border border-border">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">3. Enter Account Name</p>
                  <p className="text-foreground font-medium text-lg">{orgData.mpesa_account_name}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(orgData.mpesa_account_name)}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:border-accent text-sm font-bold uppercase transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 border border-border">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">4. Enter Amount & PIN</p>
                  <p className="text-foreground font-medium">Enter your desired amount and confirm with your M-Pesa PIN.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-muted-foreground text-sm mb-4">
                Prefer to make a larger corporate sponsorship or have questions?
              </p>
              <a 
                href={`https://wa.me/${orgData.contact_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-primary"
              >
                <Phone className="w-4 h-4" /> Contact Us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Transparency Note */}
      <section className="section-padding bg-background text-center">
        <div className="max-w-2xl mx-auto">
          <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-heading text-2xl font-bold uppercase mb-4">100% Transparent</h3>
          <p className="text-muted-foreground leading-relaxed">
            We are a registered community initiative. Every shilling donated is tracked and directly allocated to our youth programs. 
            We publish annual impact reports to show exactly how your support changes lives.
          </p>
          <Link href="/about" className="inline-block mt-6 text-sm font-bold uppercase text-accent hover:text-foreground transition-colors">
            Learn more about our impact &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}