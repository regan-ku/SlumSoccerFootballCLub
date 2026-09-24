"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Ultra-Compact Hero Section */}
      <section className="relative bg-card border-b border-border py-10 md:py-14">
        <div className="section-padding relative z-10 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight mb-2">
            Upcoming <span className="text-accent">Competitions</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Join our tournaments and friendly matches. Open to internal squads and external community teams.
          </p>
        </div>
      </section>

      {/* Compact Competitions Grid */}
      <section className="section-padding !py-8 md:!py-12">
        {loading ? (
          <div className="text-center text-muted-foreground py-12 text-sm">Loading competitions...</div>
        ) : competitions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            No upcoming competitions at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {competitions.map((comp) => {
              const regOpen = isRegistrationOpen(comp.registration_deadline);
              return (
                <div key={comp.id} className="bg-card border border-border p-5 md:p-6 hover:border-accent transition-colors flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm ${
                      comp.type === 'tournament' ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {comp.type}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm flex items-center gap-1 ${
                      regOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <Clock className="w-2.5 h-2.5" /> {regOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2 line-clamp-1">{comp.name}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-grow line-clamp-3">
                    {comp.description || "An exciting competition bringing together the best teams in the community."}
                  </p>
                  
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    {comp.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>Starts: <span className="text-foreground font-medium">{new Date(comp.start_date).toLocaleDateString()}</span></span>
                      </div>
                    )}
                    {comp.registration_deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>Deadline: <span className="text-foreground font-medium">{new Date(comp.registration_deadline).toLocaleDateString()}</span></span>
                      </div>
                    )}
                  </div>

                  {regOpen ? (
                    <Link href="/contact" className="btn-primary w-full text-center flex items-center justify-center gap-2 text-xs py-2.5">
                      Register Interest <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <button disabled className="w-full py-2.5 px-4 uppercase tracking-wider text-xs font-bold bg-muted text-muted-foreground cursor-not-allowed rounded-sm">
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