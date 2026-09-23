"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Filter, Edit3, UserX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch Players joined with Age Groups
      const { data: playersData } = await supabase
        .from("internal_players")
        .select(`
          id, first_name, last_name, position, jersey_number, is_active,
          age_groups!current_age_group_id (code, name)
        `)
        .eq("is_active", true)
        .order("last_name", { ascending: true });

      // Fetch Age Groups for the filter dropdown
      const { data: agData } = await supabase
        .from("age_groups")
        .select("id, code, name")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (playersData) setPlayers(playersData);
      if (agData) setAgeGroups(agData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 1. FILTER LOGIC
  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const matchesName = fullName.includes(searchQuery.toLowerCase());
    const matchesAge = selectedAgeGroup === "all" || player.age_groups?.code === selectedAgeGroup;
    return matchesName && matchesAge;
  });

  // 2. PAGINATION LOGIC
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPlayers = filteredPlayers.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAgeGroup]);

  // 3. SOFT DELETE LOGIC
  const handleDeactivate = async (playerId: string) => {
    if (!window.confirm("Are you sure? This will deactivate the player but keep their historical records.")) return;
    
    setDeletingId(playerId);
    const supabase = createClient();
    const { error } = await supabase
      .from("internal_players")
      .update({ is_active: false })
      .eq("id", playerId);

    if (!error) {
      setPlayers(players.filter(p => p.id !== playerId));
    } else {
      alert("Error deactivating player.");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Player Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View, search, and manage all registered players.</p>
        </div>
        <Link href="/admin/club/players/new" className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Register New Player
        </Link>
      </div>

      {/* Filters & Stats Bar */}
      <div className="bg-card border border-border p-4 rounded-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent rounded-sm"
            />
          </div>
          
          {/* Age Group Filter */}
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent rounded-sm appearance-none"
            >
              <option value="all">All Age Groups</option>
              {ageGroups.map((ag) => (
                <option key={ag.id} value={ag.code}>{ag.name} ({ag.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Count */}
        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Showing <span className="text-foreground font-bold">{paginatedPlayers.length}</span> out of{" "}
          <span className="text-foreground font-bold">{filteredPlayers.length}</span> players
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-heading text-lg uppercase">No players found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Player</th>
                  <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Age Group</th>
                  <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Position</th>
                  <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Jersey #</th>
                  <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {player.first_name} {player.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-accent/10 text-accent">
                        {player.age_groups?.code || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {player.position || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {player.jersey_number ? `#${player.jersey_number}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/club/players/${player.id}`}
                          className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-sm transition-colors"
                          title="Edit Player"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeactivate(player.id)}
                          disabled={deletingId === player.id}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors disabled:opacity-50"
                          title="Deactivate Player"
                        >
                          {deletingId === player.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredPlayers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            <span className="text-sm text-muted-foreground">
              Page <span className="font-bold text-foreground">{safeCurrentPage}</span> of{" "}
              <span className="font-bold text-foreground">{totalPages}</span>
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}