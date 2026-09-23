"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Mail, Phone, Loader2, X, Edit3, UserX, AlertCircle } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
import { staffSchema, type StaffFormData } from "@/lib/validations/staff"; // <-- IMPORT ZOD

const ROLES = ["head_coach", "assistant_coach", "goalkeeping_coach", "life_skills_instructor", "program_coordinator", "admin"];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({}); // <-- NEW: Error state

  const [formData, setFormData] = useState<StaffFormData>({
    full_name: "", role: "head_coach", email: "", phone: "", 
    qualifications: "", bio: "", photo_url: ""
  });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("staff").select("*").eq("is_active", true).order("created_at", { ascending: false });
    if (data) setStaff(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // 1. VALIDATE
    const result = staffSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
      setErrors(fieldErrors);
      setSaving(false);
      return;
    }

    // 2. SUBMIT
    const supabase = createClient();
    const { error } = await supabase.from("staff").insert([result.data]);
    
    setSaving(false);
    if (!error) {
      setShowForm(false);
      setFormData({ full_name: "", role: "head_coach", email: "", phone: "", qualifications: "", bio: "", photo_url: "" });
      fetchStaff();
    } else {
      alert("Error saving staff: " + error.message);
    }
  };

  const handleDeactivate = async (staffId: string) => {
    if (!window.confirm("Are you sure? This will remove the staff member from active lists but keep their historical records.")) return;
    setDeletingId(staffId);
    const supabase = createClient();
    const { error } = await supabase.from("staff").update({ is_active: false, left_date: new Date().toISOString() }).eq("id", staffId);
    if (!error) setStaff(staff.filter(s => s.id !== staffId));
    else alert("Error deactivating staff member.");
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Coaching & Admin Staff</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the adults leading our football and community programs.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">New Staff Member</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="font-bold text-sm uppercase">Please fix the errors below.</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Staff Photo</label>
                <FileUpload bucketName="club-media" folder="staff" value={formData.photo_url || ""} onChange={(url) => setFormData({...formData, photo_url: url})} accept="image/*" maxSizeMB={5} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <textarea value={formData.bio || ""} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" />
              </div>
              
              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-muted-foreground">Loading...</p> : staff.map((member) => (
          <div key={member.id} className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 uppercase tracking-wider">{member.role.replace('_', ' ')}</span>
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2">{member.full_name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground flex-grow">
              {member.email && <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {member.email}</p>}
              {member.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phone}</p>}
              {member.qualifications && <p className="text-xs italic mt-2">"{member.qualifications}"</p>}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Link href={`/admin/club/staff/${member.id}`} className="text-muted-foreground hover:text-accent transition-colors" title="Edit Staff"><Edit3 className="w-4 h-4" /></Link>
              <button onClick={() => handleDeactivate(member.id)} disabled={deletingId === member.id} className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50" title="Deactivate Staff">
                {deletingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
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