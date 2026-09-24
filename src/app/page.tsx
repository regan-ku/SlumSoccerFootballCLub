"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Heart, Trophy, Users, Calendar, PlayCircle, Quote, MapPin } from "lucide-react";

export default function Home() {
  const [orgData, setOrgData] = useState({ 
    name: "Kisumu GreenLand SoccerPlus Academy", 
    mission: "Empowering Kisumu's Youth Through Football and Discipline.", 
    mpesa_paybill_number: "000000", 
    mpesa_account_name: "Kisumu GreenLand Academy",
    map_embed_url: ""
  });
  const [recentGallery, setRecentGallery] = useState<any[]>([]);
  const [recentPrograms, setRecentPrograms] = useState<any[]>([]);
  const [upcomingMatch, setUpcomingMatch] = useState<any>(null);
  const [headCoach, setHeadCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const [orgRes, galleryRes, progRes, matchRes, coachRes] = await Promise.all([
        supabase.from("organization").select("name, mission, mpesa_paybill_number, mpesa_account_name, map_embed_url").limit(1).single(),
        supabase.from("gallery").select("id, title, type, url, thumbnail_url").order("created_at", { ascending: false }).limit(4),
        supabase.from("programs").select("id, name, description, photo_url, media_urls").eq("is_active", true).order("created_at", { ascending: false }).limit(3),
        supabase.from("league_fixtures").select("scheduled_date, home_team:league_teams!home_team_id(name), away_team:league_teams!away_team_id(name)").eq("status", "scheduled").order("scheduled_date", { ascending: true }).limit(1).single(),
        supabase.from("staff").select("full_name, role, photo_url, quote").eq("role", "head_coach").limit(1).single()
      ]);

      if (orgRes.data) setOrgData(orgRes.data);
      if (galleryRes.data) setRecentGallery(galleryRes.data);
      if (progRes.data) setRecentPrograms(progRes.data);
      if (matchRes.data) setUpcomingMatch(matchRes.data);
      if (coachRes.data) setHeadCoach(coachRes.data);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper to safely get the first image from an array or string
  const getFirstImage = (media: any) => {
    if (Array.isArray(media)) return media[0];
    return media;
  };

  return (
    <div className="flex flex-col">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center animate-slow-zoom opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter mb-6 leading-tight">
            More Than <span className="text-accent">Football</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-sans leading-relaxed">
            {orgData.mission}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate" className="btn-primary px-8 py-4 text-lg">Support Our Kids</Link>
            <Link href="/gallery" className="btn-outline !text-white !border-white hover:!bg-white hover:!text-black px-8 py-4 text-lg flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" /> View Highlights
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LATEST MOMENTS (Gallery Preview) */}
      <section className="section-padding bg-background">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">Latest <span className="text-accent">Moments</span></h2>
          <Link href="/gallery" className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">View All <span className="text-lg">→</span></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentGallery.map((item, idx) => {
            const displayUrl = getFirstImage(item.url);
            return (
              <Link key={item.id} href="/gallery" className={`group relative overflow-hidden rounded-sm border border-border hover:border-accent transition-all duration-300 ${idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-video'}`}>
                {item.type === 'video' && item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <img src={displayUrl || ''} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {item.type === 'video' ? <PlayCircle className="w-12 h-12 text-accent" /> : <Heart className="w-8 h-8 text-white" />}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. UPCOMING MATCH & LEADERSHIP VOICES */}
      <section className="bg-card border-y border-border">
        <div className="section-padding grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Upcoming Match */}
          <div className="bg-background border border-border p-8 rounded-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="font-heading text-xl font-bold uppercase">Next Fixture</h3>
            </div>
            {upcomingMatch ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">{new Date(upcomingMatch.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="text-right flex-1">
                    <p className="font-heading text-2xl md:text-3xl font-bold uppercase">{upcomingMatch.home_team?.name || "Home"}</p>
                  </div>
                  <div className="bg-accent/10 text-accent px-4 py-2 rounded-sm font-heading text-xl font-bold">VS</div>
                  <div className="text-left flex-1">
                    <p className="font-heading text-2xl md:text-3xl font-bold uppercase">{upcomingMatch.away_team?.name || "Away"}</p>
                  </div>
                </div>
                <Link href="/leagues" className="btn-outline w-full text-center">View Full Schedule</Link>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming fixtures scheduled.</p>
            )}
          </div>

          {/* Leadership Voice (Now uses the updatable 'quote' field) */}
          <div className="relative">
            <Quote className="absolute -top-4 -left-4 w-12 h-12 text-accent/20" />
            <blockquote className="relative z-10">
              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6 italic text-foreground">
                "{headCoach?.quote || "Football is not just a game for us; it is a vehicle for discipline, education, and building the future leaders of our community. Every child who steps on this pitch is given the tools to succeed in life."}"
              </p>
              <div className="flex items-center gap-4">
                {headCoach?.photo_url ? (
                  <img src={headCoach.photo_url} alt={headCoach.full_name} className="w-14 h-14 rounded-full object-cover border-2 border-accent" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-accent">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-heading font-bold uppercase text-foreground">{headCoach?.full_name || "Head Coach"}</p>
                  <p className="text-sm text-accent font-bold uppercase tracking-wider">Head Coach</p>
                </div>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROGRAMS */}
      <section className="section-padding bg-background">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">Our <span className="text-accent">Programs</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Beyond the pitch, we provide holistic development for our youth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPrograms.map((prog) => {
            const displayImg = getFirstImage(prog.media_urls) || getFirstImage(prog.photo_url);
            return (
              <Link key={prog.id} href={`/programs/${prog.id}`} className="group bg-card border border-border overflow-hidden hover:border-accent transition-all duration-300 flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {displayImg ? (
                    <img src={displayImg} alt={prog.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Trophy className="w-12 h-12 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-heading text-xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">{prog.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{prog.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. LOCATION MAP SECTION */}
      {orgData.map_embed_url && (
        <section className="section-padding bg-card border-y border-border">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center justify-center gap-3">
              <MapPin className="w-8 h-8 text-accent" /> Find <span className="text-accent">Us</span>
            </h2>
          </div>
          <div className="w-full h-[400px] rounded-sm overflow-hidden border border-border shadow-lg">
            <iframe 
              src={orgData.map_embed_url} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Club Location"
            />
          </div>
        </section>
      )}

      {/* 6. CAPTIVATING DONATION CTA */}
      <section className="relative py-24 md:py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        
        <div className="section-padding relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-6">
              Help Us <span className="text-accent">Change Lives</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
              Your contribution directly buys football boots, funds life skills workshops, and provides meals for our players. Be part of their journey.
            </p>
            <Link href="/donate" className="btn-primary inline-block px-8 py-4 text-lg">View Full Donation Details</Link>
          </div>

          <div className="w-full md:w-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-sm shadow-2xl min-w-[320px]">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 text-center">M-Pesa Paybill</p>
            <h3 className="font-heading text-5xl font-bold text-accent text-center mb-2">{orgData.mpesa_paybill_number}</h3>
            <div className="w-full h-px bg-white/10 my-4" />
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1 text-center">Account Name</p>
            <p className="font-heading text-xl text-white text-center font-bold">{orgData.mpesa_account_name}</p>
          </div>
        </div>
      </section>
    </div>
  );
}