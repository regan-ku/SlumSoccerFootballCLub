"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Calendar } from "lucide-react";

const PLACEHOLDER_DIVISIONS = [
  { id: "1", name: "U12 Boys Division A", season: "2026", team_count: 8 },
  { id: "2", name: "Senior Men's League", season: "2026", team_count: 12 },
];

export default function LeaguesPage() {
  const [divisions, setDivisions] = useState<any[]>(PLACEHOLDER_DIVISIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDivisions = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("league_divisions")
        .select("*")
        .eq("is_active", true);

      if (!error && data && data.length > 0) {
        setDivisions(data);
      }
      setLoading(false);
    };
    fetchDivisions();
  }, []);

  return (
    <div className="section-padding min-h-screen">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
          League <span className="text-accent">Competitions</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Track the standings, upcoming fixtures, and top performers across all our age groups and divisions.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading competitions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((div) => (
            <Link 
              key={div.id} 
              href={`/leagues/${div.id}`}
              className="group bg-card border border-border p-8 hover:border-accent transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 uppercase tracking-wider">
                    {div.season}
                  </span>
                  <Trophy className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">
                  {div.name}
                </h3>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" /> 
                <span>View Table & Fixtures</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}