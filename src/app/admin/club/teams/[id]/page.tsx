"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "", age_group_id: "", head_coach_id: "", captain_id: "", team_photo_url: "" // <-- ADDED team_photo_url
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Fetch Team Data
      const { data: teamData } = await supabase
        .from("internal_teams")
        .select("*")
        .eq("id", teamId)
        .single();

      // 2. Fetch Dropdown Data
      const { data: agData } = await supabase.from("age_groups").select("*").order("display_order");
      const { data: staffData } = await supabase.from("staff").select("id, full_name, role").eq("is_active", true);

      if (agData) setAgeGroups(agData);
      if (staffData) setStaffList(staffData);

      // 3. Pre-fill Form
      if (teamData) {
        setFormData({
          name: teamData.name || "",
          age_group_id: teamData.age_group_id || "",
          head_coach_id: teamData.head_coach_id || "",
          captain_id: teamData.captain_id || "",
          team_photo_url: teamData.team_photo_url || "" // <-- FETCH team_photo_url
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [teamId]);

  // Smart Logic: Filter players when age group changes (or on initial load)
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
    };
    fetchPlayersForCaptain();
  }, [formData.age_group_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    const supabase = createClient();
    const { error } = await supabase
      .from("internal_teams")
      .update({
        ...formData,
        head_coach_id: formData.head_coach_id || null,
        captain_id: formData.captain_id || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", teamId);

    setSaving(false);
    if (error) {
      alert("Error updating team: " + error.message);
    } else {
      setSuccess("Team updated successfully!");
      setTimeout(() => router.push("/admin/club/teams"), 2000);
    }
  };

  if (loading) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading team data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Edit Team</h1>
        <p className="text-muted-foreground text-sm mt-1">Update team details, coach, and captain assignments.</p>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
        
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
          <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
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

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Update Team"}
        </button>
      </form>
    </div>
  );
}