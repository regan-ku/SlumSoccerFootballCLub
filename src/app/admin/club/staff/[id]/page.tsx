"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

const ROLES = [
  "head_coach", "assistant_coach", "goalkeeping_coach", 
  "life_skills_instructor", "program_coordinator", "admin"
];

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "", role: "head_coach", email: "", phone: "", 
    qualifications: "", bio: "", photo_url: "" // <-- ADDED photo_url
  });

  useEffect(() => {
    const fetchStaff = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("id", staffId)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          role: data.role || "head_coach",
          email: data.email || "",
          phone: data.phone || "",
          qualifications: data.qualifications || "",
          bio: data.bio || "",
          photo_url: data.photo_url || "" // <-- FETCH photo_url
        });
      }
      setLoading(false);
    };
    fetchStaff();
  }, [staffId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    const supabase = createClient();
    const { error } = await supabase
      .from("staff")
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq("id", staffId);

    setSaving(false);
    if (error) {
      alert("Error updating staff: " + error.message);
    } else {
      setSuccess("Staff member updated successfully!");
      setTimeout(() => router.push("/admin/club/staff"), 2000);
    }
  };

  if (loading) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading staff data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Staff
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Edit Staff Member</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the staff member's details and contact information.</p>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
        
        {/* NEW: FILE UPLOAD COMPONENT */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Staff Photo (Max 5MB)</label>
          <FileUpload 
            bucketName="club-media" 
            folder="staff" 
            value={formData.photo_url} 
            onChange={(url) => setFormData({...formData, photo_url: url})} 
            accept="image/*"
            maxSizeMB={5}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Name *</label>
            <input required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Role *</label>
            <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Phone</label>
            <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Qualifications</label>
          <input value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g. CAF C License, First Aid" />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio</label>
          <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-32" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Update Staff Member"}
        </button>
      </form>
    </div>
  );
}