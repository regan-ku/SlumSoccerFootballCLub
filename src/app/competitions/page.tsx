"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Calendar, Clock, ArrowRight } from "lucide-react";

export default function PublicCompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("competitions")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });
      
      if (data) setCompetitions(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const isRegistrationOpen = (deadline: string | null) => {
    if (!deadline) return true;
    return new Date(deadline) > new Date();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="section-padding relative z-10 text-center">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-6">
            Upcoming <span className="text-accent">Competitions</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Join our tournaments and friendly matches. Open to internal squads and external community teams.
          </p>
        </div>
      </section>

      {/* Competitions Grid */}
      <section className="section-padding bg-background">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading competitions...</div>
        ) : competitions.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No upcoming competitions at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitions.map((comp) => {
              const regOpen = isRegistrationOpen(comp.registration_deadline);
              return (
                <div key={comp.id} className="bg-card border border-border p-8 hover:border-accent transition-colors flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-sm ${
                      comp.type === 'tournament' ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {comp.type}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1 ${
                      regOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <Clock className="w-3 h-3" /> {regOpen ? 'Registration Open' : 'Registration Closed'}
                    </span>
                  </div>
                  
                  <h3 className="font-heading text-2xl font-bold uppercase text-foreground mb-3">{comp.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                    {comp.description || "An exciting competition bringing together the best teams in the community."}
                  </p>
                  
                  <div className="space-y-3 text-sm text-muted-foreground mb-8">
                    {comp.start_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>Starts: <span className="text-foreground font-medium">{new Date(comp.start_date).toLocaleDateString()}</span></span>
                      </div>
                    )}
                    {comp.registration_deadline && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>Reg. Deadline: <span className="text-foreground font-medium">{new Date(comp.registration_deadline).toLocaleDateString()}</span></span>
                      </div>
                    )}
                  </div>

                  {regOpen ? (
                    <Link href="/contact" className="btn-primary w-full text-center flex items-center justify-center gap-2">
                      Register Interest <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button disabled className="w-full py-3 px-8 uppercase tracking-wider font-bold bg-muted text-muted-foreground cursor-not-allowed rounded-sm">
                      Registration Closed
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}