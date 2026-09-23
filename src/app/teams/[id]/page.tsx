"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Shield, Users } from "lucide-react";
import PlayerCard from "@/components/players/Playercard"; // Ensure capital 'C'

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;

  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 1. Fetch Team Details
      const { data: teamData } = await supabase
        .from("internal_teams")
        .select(`
          name,
          age_groups (code, name),
          staff!head_coach_id (full_name)
        `)
        .eq("id", teamId)
        .single();

      if (teamData) {
        setTeam(teamData);

        // 2. SECURELY Fetch Players using the Day 1 Security Function!
        const { data: playersData } = await supabase.rpc("get_public_players");

        if (playersData) {
          // Cast to 'any' to bypass TS strictness on nested Supabase array returns
          const ageGroupCode = (teamData.age_groups as any)?.code;
          
          // Filter the public players to only show those in this team's age group
          const teamPlayers = playersData.filter(
            (p: any) => p.age_group_code === ageGroupCode
          );
          setPlayers(teamPlayers);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [teamId]);

  if (loading) {
    return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading team details...</div>;
  }

  if (!team) {
    return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Team not found.</div>;
  }

  return (
    <div className="section-padding min-h-screen">
      <Link href="/teams" className="inline-flex items-center text-muted-foreground hover:text-accent mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teams
      </Link>

      {/* Team Header */}
      <div className="bg-card border border-border p-8 md:p-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider mb-4 inline-block">
              {(team.age_groups as any)?.code || "N/A"} | {(team.age_groups as any)?.name || "Unknown"}
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-2">
              {team.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              Head Coach: <span className="text-foreground font-medium">{(team.staff as any)?.full_name || "TBA"}</span>
            </p>
          </div>
          <div className="bg-background border border-border p-6 text-center min-w-[150px]">
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">Squad Size</p>
            <p className="font-heading text-4xl font-bold text-accent">{players.length}</p>
          </div>
        </div>
      </div>

      {/* Player Roster */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent" /> Player Roster
        </h2>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" /> {players.length} Players
        </div>
      </div>

      {players.length === 0 ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground">
          Roster will be updated soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player: any) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}