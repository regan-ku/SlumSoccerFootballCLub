"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Edit3, Plus, Filter } from "lucide-react";

export default function AdminMatchesPage() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch active divisions for the filter
      const { data: divData } = await supabase
        .from("league_divisions")
        .select("id, name, season")
        .eq("is_active", true)
        .order("season", { ascending: false });
      
      if (divData) {
        setDivisions(divData);
        if (divData.length > 0 && !selectedDivision) {
          setSelectedDivision(divData[0].id);
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDivision) return;

    const fetchFixtures = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("league_fixtures")
        .select(`
          id, scheduled_date, status, home_score, away_score,
          home_team:league_teams!home_team_id (name),
          away_team:league_teams!away_team_id (name)
        `)
        .eq("division_id", selectedDivision)
        .order("scheduled_date", { ascending: true });

      if (!error && data) setFixtures(data);
      setLoading(false);
    };

    fetchFixtures();
  }, [selectedDivision]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Match Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Record scores, log match events, and update league standings.
          </p>
        </div>
        <Link href="/admin/league/fixtures/generate" className="btn-outline flex items-center gap-2">
          <Plus className="w-4 h-4" /> Generate Fixtures
        </Link>
      </div>

      {/* Division Filter */}
      <div className="flex items-center gap-3 bg-card border border-border p-4 max-w-md">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select 
          value={selectedDivision} 
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="bg-transparent text-foreground font-medium focus:outline-none w-full"
        >
          {divisions.map(div => (
            <option key={div.id} value={div.id}>{div.name} ({div.season})</option>
          ))}
        </select>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading fixtures...</p>
        ) : fixtures.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No fixtures found for this division.</p>
        ) : (
          fixtures.map((match) => (
            <div key={match.id} className="bg-card border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-accent transition-colors">
              
              {/* Date & Status */}
              <div className="flex items-center gap-4 w-full md:w-48">
                <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground uppercase">
                    {new Date(match.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                    match.status === 'played' ? 'bg-muted text-muted-foreground' : 'bg-accent/10 text-accent'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>

              {/* Teams & Score */}
              <div className="flex-1 flex items-center justify-center gap-4 md:gap-8 w-full">
                <div className="text-right flex-1 font-heading text-lg md:text-xl font-bold uppercase text-foreground">
                  {match.home_team?.name || "Home Team"}
                </div>
                
                <div className="bg-background border border-border px-4 py-2 min-w-[80px] text-center">
                  {match.status === 'played' ? (
                    <span className="font-heading text-2xl font-bold text-accent">
                      {match.home_score} - {match.away_score}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground uppercase">VS</span>
                  )}
                </div>

                <div className="text-left flex-1 font-heading text-lg md:text-xl font-bold uppercase text-foreground">
                  {match.away_team?.name || "Away Team"}
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full md:w-40 flex justify-end">
                <Link 
                  href={`/admin/league/matches/${match.id}`}
                  className="btn-primary text-xs flex items-center justify-center gap-2 w-full"
                >
                  <Edit3 className="w-3 h-3" /> 
                  {match.status === 'played' ? 'Edit Result' : 'Record Result'}
                </Link>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}