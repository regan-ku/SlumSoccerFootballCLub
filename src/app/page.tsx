"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Heart, Trophy, Users } from "lucide-react";

export default function Home() {
  // Placeholders in case the database is empty
  const [orgData, setOrgData] = useState({
    name: "Slum Stars FC",
    mission: "Empowering the next generation through football, life skills, and community development.",
    mpesa_paybill_number: "000000",
    mpesa_account_name: "Slum Stars",
  });

  useEffect(() => {
    const fetchOrgData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("organization")
        .select("name, mission, mpesa_paybill_number, mpesa_account_name")
        .limit(1)
        .single();

      if (data) {
        setOrgData({
          name: data.name || "Slum Stars FC",
          mission: data.mission || "Empowering the next generation...",
          mpesa_paybill_number: data.mpesa_paybill_number || "000000",
          mpesa_account_name: data.mpesa_account_name || "Slum Stars",
        });
      }
    };
    fetchOrgData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90 z-10" />
        
        {/* Background Image Placeholder (Replace with a real photo of the kids playing later) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee513d461d1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter mb-6">
            More Than <span className="text-accent">Football</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-sans">
            {orgData.mission}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/donate" className="btn-primary">
              Support Our Kids
            </Link>
            <Link href="/teams" className="btn-outline !text-white !border-white hover:!bg-white hover:!text-black">
              Meet The Teams
            </Link>
          </div>
        </div>
      </section>

      {/* 2. IMPACT / MISSION SECTION */}
      <section className="section-padding bg-background text-foreground">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Our Impact
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Trophy className="w-8 h-8 text-accent" />, title: "Football Academy", desc: "Professional coaching from U7 to Senior level, keeping kids off the streets and on the pitch." },
            { icon: <Users className="w-8 h-8 text-accent" />, title: "Life Skills", desc: "Workshops on leadership, discipline, and teamwork that translate to success in life." },
            { icon: <Heart className="w-8 h-8 text-accent" />, title: "Community Outreach", desc: "Feeding programs, education support, and mentorship for the most vulnerable families." }
          ].map((item, index) => (
            <div key={index} className="bg-card p-8 border border-border hover:border-accent transition-colors duration-300">
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-heading text-2xl font-bold uppercase mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. M-PESA DONATION CTA SECTION */}
      <section className="section-padding bg-card border-y border-border text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">
          Help Us <span className="text-accent">Change Lives</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
          Your contribution buys football boots, funds life skills workshops, and provides meals for our players.
        </p>

        <div className="bg-background border border-border p-8 md:p-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">M-Pesa Paybill Number</p>
          <h3 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
            {orgData.mpesa_paybill_number}
          </h3>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Account Name</p>
          <p className="font-heading text-2xl text-accent font-bold mb-8">
            {orgData.mpesa_account_name}
          </p>
          
          <Link href="/donate" className="btn-primary inline-block">
            View Full Donation Details
          </Link>
        </div>
      </section>
    </div>
  );
}