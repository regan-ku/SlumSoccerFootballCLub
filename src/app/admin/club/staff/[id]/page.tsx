"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
import { staffSchema, type StaffFormData } from "@/lib/validations/staff"; // <-- IMPORT ZOD

const ROLES = ["head_coach", "assistant_coach", "goalkeeping_coach", "life_skills_instructor", "program_coordinator", "admin"];

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({}); // <-- NEW: Error state

  const [formData, setFormData] = useState<StaffFormData>({
    full_name: "", role: "head_coach", email: "", phone: "", 
    qualifications: "", bio: "", photo_url: ""
  });

  useEffect(() => {
    const fetchStaff = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("staff").select("*").eq("id", staffId).single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          role: data.role || "head_coach",
          email: data.email || "",
          phone: data.phone || "",
          qualifications: data.qualifications || "",
          bio: data.bio || "",
          photo_url: data.photo_url || ""
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
    setErrors({});

    // 1. VALIDATE
    const result = staffSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
      setErrors(fieldErrors);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. SUBMIT
    const supabase = createClient();
    const { error } = await supabase.from("staff").update({
      ...result.data,
      updated_at: new Date().toISOString()
    }).eq("id", staffId);

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
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Staff Photo (Max 5MB)</label>
          <FileUpload bucketName="club-media" folder="staff" value={formData.photo_url || ""} onChange={(url) => setFormData({...formData, photo_url: url})} accept="image/*" maxSizeMB={5} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name *" required value={formData.full_name} error={errors.full_name} onChange={(v) => setFormData({...formData, full_name: v})} />
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Role *</label>
            <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent ${errors.role ? 'border-red-500' : 'border-border'}`}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>)}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.role}</p>}
          </div>

          <Input label="Email" type="email" value={formData.email || ""} error={errors.email} onChange={(v) => setFormData({...formData, email: v})} />
          <Input label="Phone" value={formData.phone || ""} error={errors.phone} onChange={(v) => setFormData({...formData, phone: v})} placeholder="+254 700 000 000" />
        </div>
        
        <Input label="Qualifications" value={formData.qualifications || ""} error={errors.qualifications} onChange={(v) => setFormData({...formData, qualifications: v})} placeholder="e.g. CAF C License, First Aid" />
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio</label>
          <textarea value={formData.bio || ""} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-32" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Update Staff Member"}
        </button>
      </form>
    </div>
  );
}

interface InputProps { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; error?: string; }
function Input({ label, value, onChange, type = "text", required = false, placeholder = "", error }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{label} {required && <span className="text-accent">*</span>}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-border'}`} />
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}