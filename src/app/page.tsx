"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Heart, Trophy, Users, Activity } from "lucide-react";

export default function Home() {
  const [orgData, setOrgData] = useState({
    name: "Kisumu GreenLand SoccerPlus Academy",
    mission: "Empowering Kisumu's Youth Through Football and Discipline.",
    mpesa_paybill_number: "000000",
    mpesa_account_name: "Kisumu GreenLand Academy",
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
          name: data.name || "Kisumu GreenLand SoccerPlus Academy",
          mission: data.mission || "Empowering Kisumu's Youth Through Football and Discipline.",
          mpesa_paybill_number: data.mpesa_paybill_number || "000000",
          mpesa_account_name: data.mpesa_account_name || "Kisumu GreenLand Academy",
        });
      }
    };
    fetchOrgData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* 1. ANIMATED HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center bg-black text-white overflow-hidden">
        
        {/* A. Background Image with Slow Zoom (Ken Burns Effect) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center animate-slow-zoom opacity-30" />
        
        {/* B. Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10" />

        {/* C. Animated Hexagonal Grid Pattern (Football Texture) */}
        <div className="absolute inset-0 z-10 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300cc6a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* D. Floating Abstract Shapes */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float-slow z-10" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed z-10" />

        {/* E. Main Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full mb-6 backdrop-blur-sm">
            <Activity className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Now Registering for 2024 Season</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter mb-6 leading-tight">
            More Than <span className="text-accent">Football</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
            {orgData.mission}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/donate" className="btn-primary px-8 py-4 text-lg">
              Support Our Kids
            </Link>
            <Link href="/teams" className="btn-outline !text-white !border-white hover:!bg-white hover:!text-black px-8 py-4 text-lg">
              Meet The Teams
            </Link>
          </div>
        </div>

        {/* F. Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-accent to-transparent" />
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
            <div key={index} className="bg-card p-8 border border-border hover:border-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 bg-accent/10 w-14 h-14 rounded-sm flex items-center justify-center">{item.icon}</div>
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

        <div className="bg-background border border-border p-8 md:p-12 max-w-2xl mx-auto rounded-sm shadow-lg">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">M-Pesa Paybill Number</p>
          <h3 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
            {orgData.mpesa_paybill_number}
          </h3>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Account Name</p>
          <p className="font-heading text-2xl text-accent font-bold mb-8">
            {orgData.mpesa_account_name}
          </p>
          
          <Link href="/donate" className="btn-primary inline-block px-8 py-4 text-lg">
            View Full Donation Details
          </Link>
        </div>
      </section>
    </div>
  );
}