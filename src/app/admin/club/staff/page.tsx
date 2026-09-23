"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Mail, Phone, Loader2, X, Edit3, UserX } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

const ROLES = [
  "head_coach", "assistant_coach", "goalkeeping_coach", 
  "life_skills_instructor", "program_coordinator", "admin"
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "", role: "head_coach", email: "", phone: "", 
    qualifications: "", bio: "", photo_url: "" // <-- photo_url ADDED
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setStaff(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("staff").insert([formData]);
    
    setSaving(false);
    if (!error) {
      setShowForm(false);
      // Reset form including photo_url
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
    
    const { error } = await supabase
      .from("staff")
      .update({ is_active: false, left_date: new Date().toISOString() })
      .eq("id", staffId);

    if (!error) {
      setStaff(staff.filter(s => s.id !== staffId));
    } else {
      alert("Error deactivating staff member.");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Coaching & Admin Staff
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the adults leading our football and community programs.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Add Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">New Staff Member</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* NEW: FILE UPLOAD COMPONENT */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Staff Photo</label>
                <FileUpload 
                  bucketName="club-media" 
                  folder="staff" 
                  value={formData.photo_url} 
                  onChange={(url) => setFormData({...formData, photo_url: url})} 
                  accept="image/*"
                  maxSizeMB={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff List with Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-muted-foreground">Loading...</p> : staff.map((member) => (
          <div key={member.id} className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                {member.role.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2">{member.full_name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground flex-grow">
              {member.email && <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {member.email}</p>}
              {member.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phone}</p>}
              {member.qualifications && <p className="text-xs italic mt-2">"{member.qualifications}"</p>}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Link href={`/admin/club/staff/${member.id}`} className="text-muted-foreground hover:text-accent transition-colors" title="Edit Staff">
                <Edit3 className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => handleDeactivate(member.id)} 
                disabled={deletingId === member.id}
                className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50" 
                title="Deactivate Staff"
              >
                {deletingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}