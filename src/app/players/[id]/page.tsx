"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Shield, User, Hash, Calendar } from "lucide-react";

export default function PublicPlayerDetailPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("internal_players")
        .select(`
          id, first_name, last_name, position, jersey_number, photo_url, date_of_birth, gender,
          age_groups!current_age_group_id (code, name)
        `)
        .eq("id", playerId)
        .eq("is_active", true)
        .single();

      if (data) setPlayer(data);
      setLoading(false);
    };
    fetchData();
  }, [playerId]);

  if (loading) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading player details...</div>;
  if (!player) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Player not found.</div>;

  // Calculate age safely
  const age = player.date_of_birth 
    ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() 
    : null;

  return (
    <div className="section-padding min-h-screen">
      <Link href="/players" className="inline-flex items-center text-muted-foreground hover:text-accent mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Players
      </Link>

      <div className="max-w-4xl mx-auto bg-card border border-border p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Player Photo */}
          <div className="w-full md:w-1/3 aspect-[3/4] bg-muted rounded-sm overflow-hidden border border-border flex-shrink-0">
            {player.photo_url ? (
              <img src={player.photo_url} alt={`${player.first_name} ${player.last_name}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Player Info (SAFE DATA ONLY) */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider mb-4 inline-block w-fit">
              {player.age_groups?.code || "N/A"} | {player.gender === "male" ? "Boys" : "Girls"}
            </span>
            
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
              {player.first_name} {player.last_name}
            </h1>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center">
                  <Hash className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Jersey Number</p>
                  <p className="text-xl font-bold text-foreground">#{player.jersey_number || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Position</p>
                  <p className="text-xl font-bold text-foreground">{player.position || "Unassigned"}</p>
                </div>
              </div>

              {age && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Age</p>
                    <p className="text-xl font-bold text-foreground">{age} Years Old</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}