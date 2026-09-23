"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;

  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", date_of_birth: "", gender: "male",
    position: "", jersey_number: "", photo_url: "", // <-- photo_url ADDED
    guardian_name: "", guardian_phone: "", guardian_email: "",
    medical_conditions: "", allergies: "", school: "", grade_level: "",
    current_age_group_id: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: agData } = await supabase.from("age_groups").select("*").order("display_order");
      if (agData) setAgeGroups(agData);

      const { data: playerData, error } = await supabase
        .from("internal_players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (playerData) {
        setFormData({
          first_name: playerData.first_name || "",
          last_name: playerData.last_name || "",
          date_of_birth: playerData.date_of_birth || "",
          gender: playerData.gender || "male",
          position: playerData.position || "",
          jersey_number: playerData.jersey_number?.toString() || "",
          photo_url: playerData.photo_url || "", // <-- FETCH photo_url
          guardian_name: playerData.guardian_name || "",
          guardian_phone: playerData.guardian_phone || "",
          guardian_email: playerData.guardian_email || "",
          medical_conditions: playerData.medical_conditions || "",
          allergies: playerData.allergies || "",
          school: playerData.school || "",
          grade_level: playerData.grade_level || "",
          current_age_group_id: playerData.current_age_group_id || ""
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [playerId]);

  const handleDobChange = (dob: string) => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    const matchedGroup = ageGroups.find(g => age >= g.min_age && age <= g.max_age);
    
    setFormData(prev => ({
      ...prev,
      date_of_birth: dob,
      current_age_group_id: matchedGroup ? matchedGroup.id : prev.current_age_group_id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    const supabase = createClient();
    
    const { error } = await supabase
      .from("internal_players")
      .update({
        ...formData,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", playerId);

    setSaving(false);
    if (error) {
      alert("Error updating player: " + error.message);
    } else {
      setSuccess("Player updated successfully!");
      setTimeout(() => router.push("/admin/club/players"), 2000);
    }
  };

  if (loading) {
    return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading player data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Edit Player Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the player's details. The Age Group will recalculate automatically if the Date of Birth is changed.</p>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-8">
        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">Player Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="First Name" required value={formData.first_name} onChange={(v) => setFormData({...formData, first_name: v})} />
            <Input label="Last Name" required value={formData.last_name} onChange={(v) => setFormData({...formData, last_name: v})} />
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Date of Birth *</label>
              <input type="date" required value={formData.date_of_birth} onChange={(e) => handleDobChange(e.target.value)}
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Gender *</label>
              <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* NEW: FILE UPLOAD COMPONENT */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Player Photo</label>
              <FileUpload 
                bucketName="club-media" 
                folder="players" 
                value={formData.photo_url} 
                onChange={(url) => setFormData({...formData, photo_url: url})} 
                accept="image/*"
                maxSizeMB={5}
              />
            </div>

            <Input label="Position" value={formData.position} onChange={(v) => setFormData({...formData, position: v})} placeholder="e.g. Midfielder" />
            <Input label="Jersey Number" value={formData.jersey_number} onChange={(v) => setFormData({...formData, jersey_number: v})} type="number" />
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Assigned Age Group (Auto)</label>
              <input type="text" readOnly value={ageGroups.find(g => g.id === formData.current_age_group_id)?.name || "Unassigned"}
                className="w-full bg-muted border border-border p-3 text-accent font-bold focus:outline-none cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">Guardian & Medical (Private)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Guardian Name *" required value={formData.guardian_name} onChange={(v) => setFormData({...formData, guardian_name: v})} />
            <Input label="Guardian Phone *" required value={formData.guardian_phone} onChange={(v) => setFormData({...formData, guardian_phone: v})} />
            <Input label="Guardian Email" value={formData.guardian_email} onChange={(v) => setFormData({...formData, guardian_email: v})} type="email" />
            <Input label="School" value={formData.school} onChange={(v) => setFormData({...formData, school: v})} />
            <Input label="Grade Level" value={formData.grade_level} onChange={(v) => setFormData({...formData, grade_level: v})} />
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Medical Conditions / Allergies</label>
              <textarea value={formData.medical_conditions} onChange={(e) => setFormData({...formData, medical_conditions: e.target.value})}
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" 
                placeholder="e.g. Asthma, Peanut allergy..." />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Update Player"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "" }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent transition-colors" />
    </div>
  );
}