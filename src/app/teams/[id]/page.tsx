
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Shield, Users } from "lucide-react";
import PlayerCard from "@/components/players/Playercard";

export default function TeamDetailPage() {
  const params = useParams();
  const rawTeamId = params.id as string;

  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("Slum Stars FC");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 1. Get organization name
      const { data: orgData, error: orgError } = await supabase
        .from("organization")
        .select("name")
        .limit(1)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
      }

      if (orgData) {
        setOrgName(orgData.name || "Slum Stars FC");
      }

      // 2. Parse the dynamic team ID
      // Example: "12345-male" or "12345_female"
      const [ageGroupId, gender] = rawTeamId.split("_");

      if (!ageGroupId || !gender) {
        console.error("Invalid team ID:", rawTeamId);
        setLoading(false);
        return;
      }

      // 3. Fetch age group and coach information
      const { data: agData, error: agError } = await supabase
        .from("age_groups")
        .select(`
          id,
          code,
          name,
          male_coach:staff!male_coach_id(full_name),
          female_coach:staff!female_coach_id(full_name)
        `)
        .eq("id", ageGroupId)
        .single();

      if (agError) {
        console.error("Error fetching age group:", agError);
        setLoading(false);
        return;
      }

      if (agData) {
        // Supabase relationships can sometimes return an array
        // depending on the relationship definition.
        const maleCoach = Array.isArray(agData.male_coach)
          ? agData.male_coach[0]
          : agData.male_coach;

        const femaleCoach = Array.isArray(agData.female_coach)
          ? agData.female_coach[0]
          : agData.female_coach;

        const coachName =
          gender === "male"
            ? maleCoach?.full_name
            : femaleCoach?.full_name;

        setTeam({
          id: rawTeamId,
          name: `${orgData?.name || "Slum Stars FC"} ${
            agData.code
          } ${gender === "male" ? "Boys" : "Girls"}`,
          age_group_code: agData.code,
          age_group_name: agData.name,
          coach_name: coachName || "TBA",
          gender,
        });

        // 4. Fetch public players through the secure RPC.
        // We do NOT query internal_players directly because
        // that table contains private player information.
        const {
          data: playersData,
          error: playersError,
        } = await supabase.rpc("get_public_team_players", {
          p_age_group_id: ageGroupId,
          p_gender: gender,
        });

        if (playersError) {
          console.error(
            "Error fetching team players:",
            playersError
          );
        } else if (playersData) {
          setPlayers(playersData);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [rawTeamId]);

  if (loading) {
    return (
      <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">
        Loading squad details...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">
        Squad not found.
      </div>
    );
  }

  return (
    <div className="section-padding min-h-screen">
      <Link
        href="/teams"
        className="inline-flex items-center text-muted-foreground hover:text-accent mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Squads
      </Link>

      {/* Squad Header */}
      <div className="bg-card border border-border p-8 md:p-12 mb-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">

          {/* Squad Visual Area */}
          <div className="w-full md:w-1/3 aspect-square bg-muted rounded-sm overflow-hidden border border-border flex-shrink-0 flex items-center justify-center">
            <Shield
              className={`w-24 h-24 ${
                team.gender === "male"
                  ? "text-blue-500/50"
                  : "text-pink-500/50"
              }`}
            />
          </div>

          {/* Squad Info Area */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider mb-4 inline-block w-fit">
              {team.age_group_code} |{" "}
              {team.gender === "male" ? "Boys" : "Girls"}
            </span>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-4">
              {team.name}
            </h1>

            <p className="text-muted-foreground text-lg mb-6">
              Head Coach:{" "}
              <span className="text-foreground font-medium">
                {team.coach_name}
              </span>
            </p>

            <div className="bg-background border border-border p-6 text-center md:text-left inline-block w-fit">
              <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">
                Squad Size
              </p>

              <p className="font-heading text-4xl font-bold text-accent">
                {players.length} Players
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Roster */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent" />
          Player Roster
        </h2>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {players.length} Players
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
