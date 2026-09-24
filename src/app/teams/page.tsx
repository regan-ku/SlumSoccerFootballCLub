"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users, UserPlus } from "lucide-react";

const AGE_GROUPS = ["All", "U7", "U10", "U12", "U14", "U16", "U18", "U20", "SR"];

export default function TeamsPage() {
  const [squads, setSquads] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Get Org Name for dynamic team naming
      const { data: orgData } = await supabase.from("organization").select("name").limit(1).single();
      const orgName = orgData?.name || "Slum Stars FC";

      // 2. Fetch Age Groups with their assigned coaches
      const { data: agData, error: agError } = await supabase
        .from("age_groups")
        .select(`
          id, code, name, display_order,
          male_coach:staff!male_coach_id(full_name),
          female_coach:staff!female_coach_id(full_name)
        `)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      // 3. Fetch Player Counts per Age Group + Gender
      const { data: playersData } = await supabase
        .from("internal_players")
        .select("current_age_group_id, gender")
        .eq("is_active", true);

      if (!agError && agData) {
        const counts: Record<string, number> = {};
        if (playersData) {
          playersData.forEach((p: any) => {
            const key = `${p.current_age_group_id}_${p.gender}`;
            counts[key] = (counts[key] || 0) + 1;
          });
        }

        // Generate dynamic squads (ONLY if player_count > 0)
        const formattedSquads = agData.flatMap((ag: any) => {
          const maleCount = counts[`${ag.id}_male`] || 0;
          const femaleCount = counts[`${ag.id}_female`] || 0;
          
          const squads = [];
          
          // Only add Boys squad if there are active players
          if (maleCount > 0) {
            squads.push({
              id: `${ag.id}_male`,
              name: `${orgName} ${ag.code} Boys`,
              age_group_code: ag.code,
              gender: "male",
              coach_name: (Array.isArray(ag.male_coach) ? ag.male_coach[0] : ag.male_coach)?.full_name || "TBA",
              player_count: maleCount,
              display_order: ag.display_order
            });
          }
          
          // Only add Girls squad if there are active players
          if (femaleCount > 0) {
            squads.push({
              id: `${ag.id}_female`,
              name: `${orgName} ${ag.code} Girls`,
              age_group_code: ag.code,
              gender: "female",
              coach_name: (Array.isArray(ag.female_coach) ? ag.female_coach[0] : ag.female_coach)?.full_name || "TBA",
              player_count: femaleCount,
              display_order: ag.display_order
            });
          }
          
          return squads;
        });

        // Sort by display order
        formattedSquads.sort((a, b) => a.display_order - b.display_order);
        setSquads(formattedSquads);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredSquads = filter === "All" 
    ? squads 
    : squads.filter((squad) => squad.age_group_code === filter);

  return (
    <div className="section-padding min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
          Our <span className="text-accent">Squads</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          From grassroots U7s to our Senior squad, meet the teams representing our community with pride and discipline.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {AGE_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setFilter(group)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
              filter === group
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {group === "SR" ? "Senior" : group}
          </button>
        ))}
      </div>

      {/* Squads Grid */}
      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading squads...</div>
      ) : filteredSquads.length === 0 ? (
        <div className="text-center text-muted-foreground py-20 bg-card border border-border rounded-sm p-12">
          <p className="font-heading text-lg uppercase">No active squads found for this age group yet.</p>
          <p className="text-sm mt-1">Check back soon as new teams are formed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSquads.map((squad) => (
            <Link 
              key={squad.id} 
              href={`/teams/${squad.id}`} 
              className="group bg-card border border-border overflow-hidden hover:border-accent transition-all duration-300 flex flex-col"
            >
              {/* Squad Visual Area */}
              <div className="aspect-video bg-muted relative overflow-hidden flex items-center justify-center">
                <Shield className={`w-16 h-16 ${squad.gender === 'male' ? 'text-blue-500/50' : 'text-pink-500/50'}`} />
                <div className="absolute top-3 left-3">
                  <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                    {squad.age_group_code} {squad.gender === 'male' ? 'Boys' : 'Girls'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-heading text-xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">
                  {squad.name}
                </h3>
                
                <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Head Coach: {squad.coach_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> {squad.player_count} Active Players
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}