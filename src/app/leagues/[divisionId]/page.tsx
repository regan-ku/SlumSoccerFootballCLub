"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Trophy, Calendar, Target, Users } from "lucide-react";

type Tab = "table" | "fixtures" | "scorers";

export default function LeagueDetailPage() {
  const params = useParams();
  const divisionId = params.divisionId as string;
  const [activeTab, setActiveTab] = useState<Tab>("table");

  const [division, setDivision] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 1. Fetch Division Info
      const { data: divData } = await supabase.from("league_divisions").select("*").eq("id", divisionId).single();
      setDivision(divData);

      // 2. Fetch Standings (Joined with Team Names)
      const { data: standingsData } = await supabase
        .from("league_standings_cache")
        .select("*, league_teams(name)")
        .eq("division_id", divisionId)
        .order("position", { ascending: true });
      setStandings(standingsData || []);

      // 3. Fetch Fixtures (Joined with Home & Away Team Names)
      const { data: fixturesData } = await supabase
        .from("league_fixtures")
        .select(`
          *,
          home_team:league_teams!home_team_id(name),
          away_team:league_teams!away_team_id(name)
        `)
        .eq("division_id", divisionId)
        .order("scheduled_date", { ascending: true });
      setFixtures(fixturesData || []);

      // 4. Fetch Top Scorers (Joined with Player & Team Names)
      const { data: scorersData } = await supabase
        .from("player_stats_cache")
        .select(`
          *,
          league_players(full_name, jersey_number, league_teams(name))
        `)
        .eq("division_id", divisionId)
        .order("goals", { ascending: false })
        .limit(10);
      setScorers(scorersData || []);

      setLoading(false);
    };
    fetchData();
  }, [divisionId]);

  if (loading) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading league data...</div>;
  if (!division) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">League not found.</div>;

  return (
    <div className="section-padding min-h-screen">
      <Link href="/leagues" className="inline-flex items-center text-muted-foreground hover:text-accent mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Leagues
      </Link>

      {/* Header */}
      <div className="mb-10">
        <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider mb-2 inline-block">
          {division.season} Season
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight">
          {division.name}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {[
          { id: "table", label: "Standings", icon: <Trophy className="w-4 h-4" /> },
          { id: "fixtures", label: "Fixtures & Results", icon: <Calendar className="w-4 h-4" /> },
          { id: "scorers", label: "Top Scorers", icon: <Target className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-accent text-accent-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STANDINGS TABLE */}
      {activeTab === "table" && (
        <div className="overflow-x-auto bg-card border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">#</th>
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold text-center">P</th>
                <th className="p-4 font-bold text-center">W</th>
                <th className="p-4 font-bold text-center">D</th>
                <th className="p-4 font-bold text-center">L</th>
                <th className="p-4 font-bold text-center hidden md:table-cell">GD</th>
                <th className="p-4 font-bold text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Standings will appear once matches are played.</td></tr>
              ) : (
                standings.map((row: any) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-bold text-accent">{row.position}</td>
                    <td className="p-4 font-bold text-foreground uppercase">{row.league_teams?.name || "Unknown Team"}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.played}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.won}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.drawn}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.lost}</td>
                    <td className="p-4 text-center text-muted-foreground hidden md:table-cell">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="p-4 text-center font-bold text-foreground text-lg">{row.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: FIXTURES & RESULTS */}
      {activeTab === "fixtures" && (
        <div className="space-y-4">
          {fixtures.length === 0 ? (
            <div className="bg-card border border-border p-8 text-center text-muted-foreground">No fixtures scheduled yet.</div>
          ) : (
            fixtures.map((match: any) => (
              <div key={match.id} className="bg-card border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider w-full md:w-32 text-center md:text-left">
                  {new Date(match.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                
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

                <div className="w-full md:w-32 text-center">
                  <span className={`text-xs font-bold uppercase px-2 py-1 ${
                    match.status === 'played' ? 'bg-muted text-muted-foreground' : 'bg-accent/10 text-accent'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: TOP SCORERS */}
      {activeTab === "scorers" && (
        <div className="bg-card border border-border overflow-hidden">
          {scorers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No goals scored yet this season.</div>
          ) : (
            scorers.map((stat: any, index: number) => (
              <div key={stat.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-2xl font-bold text-muted-foreground w-8">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-heading text-lg font-bold uppercase text-foreground">
                      {stat.league_players?.full_name || "Unknown Player"}
                    </h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {stat.league_players?.league_teams?.name || "Unknown Team"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="font-heading text-2xl font-bold text-accent">
                    {stat.goals}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}