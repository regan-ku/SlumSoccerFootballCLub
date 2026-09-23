"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
import { teamSchema, type TeamFormData } from "@/lib/validations/teams"; // <-- IMPORT ZOD

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
  const [errors, setErrors] = useState<Record<string, string>>({}); // <-- NEW: Error state

  const [formData, setFormData] = useState<TeamFormData>({
    name: "", age_group_id: "", head_coach_id: "", captain_id: "", team_photo_url: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: teamData } = await supabase.from("internal_teams").select("*").eq("id", teamId).single();
      const { data: agData } = await supabase.from("age_groups").select("*").order("display_order");
      const { data: staffData } = await supabase.from("staff").select("id, full_name, role").eq("is_active", true);

      if (agData) setAgeGroups(agData);
      if (staffData) setStaffList(staffData);

      if (teamData) {
        setFormData({
          name: teamData.name || "",
          age_group_id: teamData.age_group_id || "",
          head_coach_id: teamData.head_coach_id || "",
          captain_id: teamData.captain_id || "",
          team_photo_url: teamData.team_photo_url || ""
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [teamId]);

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
    setErrors({});

    // 1. VALIDATE DATA WITH ZOD
    const result = teamSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return; // STOP execution
    }

    // 2. Submit CLEANED data
    const supabase = createClient();
    const { error } = await supabase
      .from("internal_teams")
      .update({
        ...result.data,
        head_coach_id: result.data.head_coach_id || null,
        captain_id: result.data.captain_id || null,
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
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors no-print">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Edit Team</h1>
        <p className="text-muted-foreground text-sm mt-1">Update team details, coach, and captain assignments.</p>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      {/* Global Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm uppercase">Please fix the following errors:</p>
            <ul className="text-sm list-disc list-inside mt-1">
              {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Photo / Logo (Max 5MB)</label>
          <FileUpload 
            bucketName="club-media" 
            folder="teams" 
            value={formData.team_photo_url || ""} 
            onChange={(url) => setFormData({...formData, team_photo_url: url})} 
            accept="image/*"
            maxSizeMB={5}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Name *</label>
          <Input 
            required 
            value={formData.name} 
            error={errors.name} 
            onChange={(v) => setFormData({...formData, name: v})} 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Age Group *</label>
          <select 
            required 
            value={formData.age_group_id} 
            onChange={(e) => setFormData({...formData, age_group_id: e.target.value})} 
            className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent transition-colors ${errors.age_group_id ? 'border-red-500' : 'border-border'}`}
          >
            <option value="">Select Age Group</option>
            {ageGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name} ({ag.code})</option>)}
          </select>
          {errors.age_group_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.age_group_id}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Head Coach</label>
          <select 
            value={formData.head_coach_id || ""} 
            onChange={(e) => setFormData({...formData, head_coach_id: e.target.value})} 
            className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">Unassigned</option>
            {staffList.filter(s => s.role.includes('coach')).map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role.replace('_',' ')})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team Captain</label>
          <select 
            value={formData.captain_id || ""} 
            onChange={(e) => setFormData({...formData, captain_id: e.target.value})} 
            className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" 
            disabled={!formData.age_group_id}
          >
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

// Updated Input Component to support inline errors
interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "", error }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <input 
        type={type} 
        required={required} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent transition-colors ${
          error ? 'border-red-500 focus:border-red-500' : 'border-border'
        }`} 
      />
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}