"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trophy, Calendar, Users, Loader2, X, Edit3, UserX } from "lucide-react";

const AGE_GROUPS = ["U7", "U10", "U12", "U14", "U16", "U18", "U20", "SR"];
const GENDERS = ["mixed", "male", "female"];

export default function AdminDivisionsPage() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    season: new Date().getFullYear().toString(),
    age_group_code: "U12",
    gender: "mixed",
    is_active: true
  });

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("league_divisions")
      .select("*")
      .order("season", { ascending: false })
      .order("name", { ascending: true });
    
    if (data) setDivisions(data);
    setLoading(false);
  };

  const openForm = (division: any = null) => {
    if (division) {
      setEditingId(division.id);
      setFormData({
        name: division.name,
        season: division.season,
        age_group_code: division.age_group_code,
        gender: division.gender,
        is_active: division.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        season: new Date().getFullYear().toString(),
        age_group_code: "U12",
        gender: "mixed",
        is_active: true
      });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    let error;
    if (editingId) {
      const res = await supabase.from("league_divisions").update(formData).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("league_divisions").insert([formData]);
      error = res.error;
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setEditingId(null);
      fetchDivisions();
    } else {
      alert("Error saving division: " + error.message);
    }
  };

  const handleDeactivate = async (divId: string) => {
    if (!window.confirm("Are you sure? This will hide the division but keep historical match data.")) return;
    
    setDeletingId(divId);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("league_divisions")
      .update({ is_active: false })
      .eq("id", divId);

    if (!error) {
      setDivisions(divisions.filter(d => d.id !== divId));
    } else {
      alert("Error deactivating division.");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            League Divisions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage league seasons and age group categories.
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Division
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                {editingId ? "Edit Division" : "New Division"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Division Name *</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" 
                  placeholder="e.g. Premier League Division A" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Season *</label>
                  <input 
                    required 
                    value={formData.season} 
                    onChange={(e) => setFormData({...formData, season: e.target.value})} 
                    className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" 
                    placeholder="e.g. 2026" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Age Group *</label>
                  <select 
                    required 
                    value={formData.age_group_code} 
                    onChange={(e) => setFormData({...formData, age_group_code: e.target.value})} 
                    className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent"
                  >
                    {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Gender Category *</label>
                <select 
                  required 
                  value={formData.gender} 
                  onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                  className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent"
                >
                  {GENDERS.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Division" : "Create Division")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-12">Loading divisions...</p>
        ) : divisions.filter(d => d.is_active).length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">No active divisions found. Create one to get started.</p>
        ) : (
          divisions.filter(d => d.is_active).map((div) => (
            <div key={div.id} className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <Trophy className="w-8 h-8 text-accent" />
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                  {div.season}
                </span>
              </div>
              
              <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2">{div.name}</h3>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-6 flex-grow">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Age Group: <span className="text-foreground font-medium">{div.age_group_code}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Gender: <span className="text-foreground font-medium">{div.gender.toUpperCase()}</span></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button 
                  onClick={() => openForm(div)} 
                  className="text-muted-foreground hover:text-accent transition-colors" 
                  title="Edit Division"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeactivate(div.id)} 
                  disabled={deletingId === div.id}
                  className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50" 
                  title="Deactivate Division"
                >
                  {deletingId === div.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}