"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Shield, Users, Loader2, X, Edit3, UserX } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", age_group_id: "", head_coach_id: "", captain_id: "", team_photo_url: "" // <-- ADDED team_photo_url
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: teamsData } = await supabase
        .from("internal_teams")
        .select(`
          id, name, is_active,
          age_groups (code, name),
          staff!head_coach_id (full_name),
          internal_players!captain_id (first_name, last_name)
        `)
        .eq("is_active", true);
      
      const { data: agData } = await supabase.from("age_groups").select("*").order("display_order");
      const { data: staffData } = await supabase.from("staff").select("id, full_name, role").eq("is_active", true);

      if (teamsData) setTeams(teamsData);
      if (agData) setAgeGroups(agData);
      if (staffData) setStaffList(staffData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPlayersForCaptain = async () => {
      if (!formData.age_group_id) {
        setPlayersList([]);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("internal_players")
        .select("id, first_name, last_name")
        .eq("current_age_group_id", formData.age_group_id)
        .eq("is_active", true)
        .order("first_name");
      setPlayersList(data || []);
      setFormData(prev => ({ ...prev, captain_id: "" }));
    };
    fetchPlayersForCaptain();
  }, [formData.age_group_id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("internal_teams").insert([{
      ...formData,
      head_coach_id: formData.head_coach_id || null,
      captain_id: formData.captain_id || null
    }]);
    
    setSaving(false);
    if (!error) {
      setShowForm(false);
      // Reset form including team_photo_url
      setFormData({ name: "", age_group_id: "", head_coach_id: "", captain_id: "", team_photo_url: "" });
      window.location.reload();
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleDeactivate = async (teamId: string) => {
    if (!window.confirm("Are you sure? This will disband the team but keep historical stats.")) return;
    
    setDeletingId(teamId);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("internal_teams")
      .update({ is_active: false, disbanded_date: new Date().toISOString() })
      .eq("id", teamId);

    if (!error) {
      setTeams(teams.filter(t => t.id !== teamId));
    } else {
      alert("Error disbanding team.");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Internal Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">Create squads and assign Head Coaches and Captains.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {/* Create Team Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">Create New Team</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* NEW: TEAM PHOTO UPLOAD */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Photo / Logo (Max 5MB)</label>
                <FileUpload 
                  bucketName="club-media" 
                  folder="teams" 
                  value={formData.team_photo_url} 
                  onChange={(url) => setFormData({...formData, team_photo_url: url})} 
                  accept="image/*"
                  maxSizeMB={5}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Name *</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g. Slum Stars U12" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Age Group *</label>
                <select required value={formData.age_group_id} onChange={(e) => setFormData({...formData, age_group_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                  <option value="">Select Age Group</option>
                  {ageGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name} ({ag.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Head Coach</label>
                <select value={formData.head_coach_id} onChange={(e) => setFormData({...formData, head_coach_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                  <option value="">Unassigned</option>
                  {staffList.filter(s => s.role.includes('coach')).map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role.replace('_',' ')})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Captain</label>
                <select value={formData.captain_id} onChange={(e) => setFormData({...formData, captain_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" disabled={!formData.age_group_id}>
                  <option value="">{formData.age_group_id ? "Select Player" : "Select Age Group First"}</option>
                  {playersList.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Team"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Teams Grid with Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-muted-foreground">Loading...</p> : teams.map((team) => (
          <div key={team.id} className="bg-card border border-border p-6 hover:border-accent transition-colors relative flex flex-col">
            <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
              {team.age_groups?.code}
            </div>
            <Shield className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-heading text-2xl font-bold uppercase text-foreground mb-4">{team.name}</h3>
            
            <div className="space-y-3 text-sm flex-grow">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Head Coach</p>
                  <p className="text-foreground font-medium">{team.staff?.full_name || "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Captain</p>
                  <p className="text-foreground font-medium">
                    {team.internal_players ? `${team.internal_players.first_name} ${team.internal_players.last_name}` : "Unassigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Link href={`/admin/club/teams/${team.id}`} className="text-muted-foreground hover:text-accent transition-colors" title="Edit Team">
                <Edit3 className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => handleDeactivate(team.id)} 
                disabled={deletingId === team.id}
                className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50" 
                title="Disband Team"
              >
                {deletingId === team.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}