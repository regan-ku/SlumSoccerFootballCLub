"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users } from "lucide-react";

// Placeholder data in case the database is empty
const PLACEHOLDER_TEAMS = [
  { id: "1", name: "Slum Stars U10", age_group_code: "U10", coach_name: "Coach John", player_count: 15 },
  { id: "2", name: "Slum Stars U14", age_group_code: "U14", coach_name: "Coach Sarah", player_count: 18 },
  { id: "3", name: "Slum Stars Senior", age_group_code: "SR", coach_name: "Coach David", player_count: 22 },
];

const AGE_GROUPS = ["All", "U7", "U10", "U12", "U14", "U16", "U18", "U20", "SR"];

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>(PLACEHOLDER_TEAMS);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      const supabase = createClient();
      
      // Fetch teams joined with age groups and staff (for coach name)
      const { data, error } = await supabase
        .from("internal_teams")
        .select(`
          id,
          name,
          is_active,
          age_groups (code),
          staff!head_coach_id (full_name)
        `)
        .eq("is_active", true);

      if (!error && data) {
        const formattedTeams = data.map((team: any) => ({
          id: team.id,
          name: team.name,
          age_group_code: team.age_groups?.code || "SR",
          coach_name: team.staff?.full_name || "TBA",
          player_count: 0, // We will add player counting in a later optimization
        }));
        setTeams(formattedTeams);
      }
      setLoading(false);
    };

    fetchTeams();
  }, []);

  const filteredTeams = filter === "All" 
    ? teams 
    : teams.filter((team) => team.age_group_code === filter);

  return (
    <div className="section-padding min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
          Our <span className="text-accent">Teams</span>
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

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading teams...</div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          No teams found for this age group yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Link 
              key={team.id} 
              href={`/teams/${team.id}`}
              className="group bg-card border border-border p-6 hover:border-accent transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 uppercase tracking-wider">
                  {team.age_group_code}
                </span>
                <Shield className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              
              <h3 className="font-heading text-2xl font-bold uppercase mb-2 group-hover:text-accent transition-colors">
                {team.name}
              </h3>
              
              <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Head Coach: {team.coach_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}