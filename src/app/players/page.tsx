"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter } from "lucide-react";
import PlayerCard from "@/components/players/Playercard";

export default function PublicPlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [ageGroups, setAgeGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch active age groups for filtering
      const { data: agData } = await supabase
        .from("age_groups")
        .select("id, code, name")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (agData) setAgeGroups(agData);

      // Fetch PUBLIC player data ONLY (No sensitive info, includes BOTH boys and girls)
      const { data: playersData } = await supabase
        .from("internal_players")
        .select(`
          id, first_name, last_name, position, jersey_number, photo_url, gender,
          age_groups!current_age_group_id (code, name)
        `)
        .eq("is_active", true)
        .order("last_name", { ascending: true });

      if (playersData) setPlayers(playersData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Advanced Filtering Logic
  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    
    const matchesName = fullName.includes(searchQuery.toLowerCase());
    const matchesAge = selectedAgeGroup === "All" || player.age_groups?.code === selectedAgeGroup;
    const matchesGender = selectedGender === "All" || player.gender === selectedGender.toLowerCase();
    
    return matchesName && matchesAge && matchesGender;
  });

  return (
    <div className="section-padding min-h-screen">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
          Meet Our <span className="text-accent">Players</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          The talented individuals who represent our club with pride, discipline, and passion.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-sm mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Text Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        
        {/* Age Group Filter */}
        <div className="relative md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent rounded-sm appearance-none"
          >
            <option value="All">All Age Groups</option>
            {ageGroups.map((ag) => (
              <option key={ag.id} value={ag.code}>{ag.code} ({ag.name})</option>
            ))}
          </select>
        </div>

        {/* Gender / Squad Filter */}
        <div className="relative md:w-48">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent rounded-sm appearance-none"
          >
            <option value="All">All Squads</option>
            <option value="male">Boys Squads</option>
            <option value="female">Girls Squads</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-muted-foreground">
        Showing <span className="font-bold text-foreground">{filteredPlayers.length}</span> player{filteredPlayers.length !== 1 ? 's' : ''}
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading players...</div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center text-muted-foreground py-20 bg-card border border-border rounded-sm p-12">
          <p className="font-heading text-lg uppercase">No players found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}