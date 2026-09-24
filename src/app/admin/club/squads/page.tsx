"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Users, Shield, UserPlus, ArrowRight } from "lucide-react";

export default function AdminSquadsPage() {
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Get Age Groups with their assigned coaches
      const { data: agData } = await supabase
        .from("age_groups")
        .select(`
          id, code, name, display_order,
          male_coach:staff!male_coach_id(id, full_name),
          female_coach:staff!female_coach_id(id, full_name)
        `)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      // 2. Get Active Staff for dropdowns
      const { data: staffData } = await supabase.from("staff").select("id, full_name, role").eq("is_active", true);

      // 3. Get Player Counts per Age Group + Gender
      const { data: playersData } = await supabase
        .from("internal_players")
        .select("current_age_group_id, gender")
        .eq("is_active", true);

      if (agData) setAgeGroups(agData);
      if (staffData) setStaffList(staffData);
      
      // Calculate counts
      if (playersData) {
        const counts: Record<string, number> = {};
        playersData.forEach((p: any) => {
          const key = `${p.current_age_group_id}_${p.gender}`;
          counts[key] = (counts[key] || 0) + 1;
        });
        setPlayerCounts(counts);
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const updateCoach = async (ageGroupId: string, gender: "male" | "female", coachId: string) => {
    const supabase = createClient();
    const column = gender === "male" ? "male_coach_id" : "female_coach_id";
    
    const { error } = await supabase
      .from("age_groups")
      .update({ [column]: coachId || null })
      .eq("id", ageGroupId);

    if (!error) {
      // Optimistically update local state to avoid full page reload
      setAgeGroups(prev => prev.map(ag => {
        if (ag.id === ageGroupId) {
          const coach = staffList.find(s => s.id === coachId);
          return {
            ...ag,
            [`${gender}_coach`]: coach ? { id: coach.id, full_name: coach.full_name } : null
          };
        }
        return ag;
      }));
    } else {
      alert("Error updating coach: " + error.message);
    }
  };

  if (loading) return <div className="section-padding text-center text-muted-foreground pt-20">Loading squads...</div>;

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Internal Squads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Teams are automatically generated based on Age Group and Gender.
          </p>
        </div>
        <Link href="/admin/club/players/new" className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Register Player
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ageGroups.map((ag) => {
          const maleCount = playerCounts[`${ag.id}_male`] || 0;
          const femaleCount = playerCounts[`${ag.id}_female`] || 0;
          const maleCoach = Array.isArray(ag.male_coach) ? ag.male_coach[0] : ag.male_coach;
          const femaleCoach = Array.isArray(ag.female_coach) ? ag.female_coach[0] : ag.female_coach;

          return (
            <div key={ag.id} className="bg-card border border-border p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Shield className="w-6 h-6 text-accent" />
                <h2 className="font-heading text-xl font-bold uppercase text-foreground">{ag.name}</h2>
              </div>

              {/* BOYS SQUAD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Boys Squad
                  </h3>
                  <span className="text-xs font-bold bg-muted px-2 py-1 rounded-sm">{maleCount} Players</span>
                </div>
                
                <select 
                  value={maleCoach?.id || ""} 
                  onChange={(e) => updateCoach(ag.id, "male", e.target.value)}
                  className="w-full bg-background border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent rounded-sm"
                >
                  <option value="">Assign Head Coach...</option>
                  {staffList.filter(s => s.role.includes("coach")).map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>

                <Link 
                  href={`/admin/club/players?ageGroup=${ag.id}&gender=male`}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold uppercase bg-muted hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                >
                  <span>View Roster</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="border-t border-border" />

              {/* GIRLS SQUAD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500" /> Girls Squad
                  </h3>
                  <span className="text-xs font-bold bg-muted px-2 py-1 rounded-sm">{femaleCount} Players</span>
                </div>
                
                <select 
                  value={femaleCoach?.id || ""} 
                  onChange={(e) => updateCoach(ag.id, "female", e.target.value)}
                  className="w-full bg-background border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent rounded-sm"
                >
                  <option value="">Assign Head Coach...</option>
                  {staffList.filter(s => s.role.includes("coach")).map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>

                <Link 
                  href={`/admin/club/players?ageGroup=${ag.id}&gender=female`}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold uppercase bg-muted hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                >
                  <span>View Roster</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}