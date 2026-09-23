"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, X, Shield, Globe, Edit3 } from "lucide-react";

export default function AdminLeagueTeamsPage() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [internalTeams, setInternalTeams] = useState<any[]>([]);
  const [leagueTeams, setLeagueTeams] = useState<any[]>([]);
  
  const [selectedDiv, setSelectedDiv] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Track if we are editing

  const [formData, setFormData] = useState({
    type: "external", name: "", internal_team_id: "", external_club_name: "", coach_name: "", coach_contact: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: divData } = await supabase.from("league_divisions").select("*").eq("is_active", true);
      const { data: intData } = await supabase.from("internal_teams").select("id, name").eq("is_active", true);
      
      if (divData) {
        setDivisions(divData);
        if (divData.length > 0 && !selectedDiv) setSelectedDiv(divData[0].id);
      }
      if (intData) setInternalTeams(intData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDiv) return;
    const fetchLeagueTeams = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("league_teams")
        .select(`
          id, name, type, external_club_name, coach_name, coach_contact,
          internal_teams (name)
        `)
        .eq("division_id", selectedDiv)
        .eq("is_active", true);
      if (data) setLeagueTeams(data);
    };
    fetchLeagueTeams();
  }, [selectedDiv]);

  // Open form for Create or Edit
  const openForm = (team: any = null) => {
    if (team) {
      setEditingId(team.id);
      setFormData({
        type: team.type,
        name: team.name,
        internal_team_id: team.internal_teams?.id || "",
        external_club_name: team.external_club_name || "",
        coach_name: team.coach_name || "",
        coach_contact: team.coach_contact || ""
      });
    } else {
      setEditingId(null);
      setFormData({ type: "external", name: "", internal_team_id: "", external_club_name: "", coach_name: "", coach_contact: "" });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      division_id: selectedDiv,
      type: formData.type,
      name: formData.type === "internal" ? internalTeams.find(t => t.id === formData.internal_team_id)?.name : formData.name,
      internal_team_id: formData.type === "internal" ? formData.internal_team_id : null,
      external_club_name: formData.type === "external" ? formData.external_club_name : null,
      coach_name: formData.coach_name || null,
      coach_contact: formData.coach_contact || null,
    };

    let error;
    if (editingId) {
      // UPDATE existing team
      const res = await supabase.from("league_teams").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      // INSERT new team
      const res = await supabase.from("league_teams").insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setEditingId(null);
      // Refresh list
      const { data } = await supabase.from("league_teams").select(`id, name, type, external_club_name, coach_name, coach_contact, internal_teams (name)`).eq("division_id", selectedDiv).eq("is_active", true);
      if (data) setLeagueTeams(data);
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this team from the division?")) return;
    const supabase = createClient();
    await supabase.from("league_teams").update({ is_active: false }).eq("id", id);
    setLeagueTeams(leagueTeams.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">League Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">Register internal and external teams into league divisions.</p>
        </div>
        <button onClick={() => openForm()} disabled={!selectedDiv} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Register Team
        </button>
      </div>

      {/* Division Selector */}
      <div className="bg-card border border-border p-4 max-w-md">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Division</label>
        <select value={selectedDiv} onChange={(e) => setSelectedDiv(e.target.value)} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
          {divisions.map(div => <option key={div.id} value={div.id}>{div.name} ({div.season})</option>)}
        </select>
      </div>

      {/* Modal Form (Handles both Create and Update) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                {editingId ? "Edit Team" : "Register Team"}
              </h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, type: "internal"})} className={`p-3 border text-sm font-bold uppercase ${formData.type === 'internal' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>Internal</button>
                <button type="button" onClick={() => setFormData({...formData, type: "external"})} className={`p-3 border text-sm font-bold uppercase ${formData.type === 'external' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>External</button>
              </div>

              {formData.type === "internal" ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Internal Team *</label>
                  <select required value={formData.internal_team_id} onChange={(e) => setFormData({...formData, internal_team_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                    <option value="">Choose Team</option>
                    {internalTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">External Club Name *</label>
                  <input required value={formData.external_club_name} onChange={(e) => setFormData({...formData, external_club_name: e.target.value, name: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Head Coach Name</label>
                <input value={formData.coach_name} onChange={(e) => setFormData({...formData, coach_name: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Coach Contact (Phone/Email)</label>
                <input value={formData.coach_contact} onChange={(e) => setFormData({...formData, coach_contact: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Team" : "Register Team")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Teams List with Edit & Delete Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagueTeams.length === 0 ? <p className="text-muted-foreground col-span-full text-center py-8">No teams registered in this division yet.</p> : leagueTeams.map((team) => (
          <div key={team.id} className="bg-card border border-border p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                {team.type === 'internal' ? <Shield className="w-5 h-5 text-accent" /> : <Globe className="w-5 h-5 text-blue-400" />}
                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-muted text-muted-foreground">{team.type}</span>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-foreground mb-1">{team.name}</h3>
              {team.type === 'external' && team.external_club_name && <p className="text-xs text-muted-foreground mb-3">Club: {team.external_club_name}</p>}
              {team.coach_name && <p className="text-xs text-muted-foreground">Coach: {team.coach_name}</p>}
              {team.coach_contact && <p className="text-xs text-muted-foreground">Contact: {team.coach_contact}</p>}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button onClick={() => openForm(team)} className="text-muted-foreground hover:text-accent transition-colors" title="Edit Team">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(team.id)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Remove Team">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}