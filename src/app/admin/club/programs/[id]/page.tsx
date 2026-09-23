"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";

const CATEGORIES = [
  "life_skills", "community_outreach", "education", 
  "health", "mentorship", "training", "player_development"
];

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const progId = params.id as string;

  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Changed ages to strings to match input field behavior
  const [formData, setFormData] = useState({
    name: "", category: "life_skills", description: "",
    target_age_min: "5", target_age_max: "20",
    schedule: "", location: "", coordinator_id: "",
    photo_url: "", video_url: "", media_type: "image"
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Fetch Staff for dropdown
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, full_name, role")
        .eq("is_active", true);
      if (staffData) setStaffList(staffData);

      // 2. Fetch Existing Program Data
      const { data: progData, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", progId)
        .single();

      if (progData) {
        setFormData({
          name: progData.name || "",
          category: progData.category || "life_skills",
          description: progData.description || "",
          // Convert numbers to strings for the form inputs
          target_age_min: progData.target_age_min?.toString() || "5",
          target_age_max: progData.target_age_max?.toString() || "20",
          schedule: progData.schedule || "",
          location: progData.location || "",
          coordinator_id: progData.coordinator_id || "",
          photo_url: progData.photo_url || "",
          video_url: progData.video_url || "",
          media_type: progData.media_type || "image"
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [progId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    const supabase = createClient();
    const { error } = await supabase
      .from("programs")
      .update({
        ...formData,
        // Parse strings back to numbers for the database
        target_age_min: parseInt(formData.target_age_min) || 5,
        target_age_max: parseInt(formData.target_age_max) || 20,
        coordinator_id: formData.coordinator_id || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", progId);

    setSaving(false);
    if (error) {
      alert("Error updating program: " + error.message);
    } else {
      setSuccess("Program updated successfully!");
      setTimeout(() => router.push("/admin/club/programs"), 2000);
    }
  };

  if (loading) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading program data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Programs
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Edit Program</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the details of this community initiative.</p>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Program Name *</label>
            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g. Weekend Mentorship" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category *</label>
            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Coordinator</label>
            <select value={formData.coordinator_id} onChange={(e) => setFormData({...formData, coordinator_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
              <option value="">Unassigned</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role.replace('_',' ')})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Min Age</label>
            <input type="number" required value={formData.target_age_min} onChange={(e) => setFormData({...formData, target_age_min: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Max Age</label>
            <input type="number" required value={formData.target_age_max} onChange={(e) => setFormData({...formData, target_age_max: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Schedule</label>
            <input value={formData.schedule} onChange={(e) => setFormData({...formData, schedule: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g. Saturdays 9AM - 12PM" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Location</label>
            <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g. Community Hall" />
          </div>

          {/* Media Type Selection */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Media Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, media_type: "image"})}
                className={`p-3 border text-sm font-bold uppercase transition-colors ${
                  formData.media_type === 'image' 
                    ? 'border-accent text-accent bg-accent/10' 
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                Photo
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, media_type: "video"})}
                className={`p-3 border text-sm font-bold uppercase transition-colors ${
                  formData.media_type === 'video' 
                    ? 'border-accent text-accent bg-accent/10' 
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                Video
              </button>
            </div>
          </div>

          {/* Conditional Media URL Input */}
          {formData.media_type === 'image' ? (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Photo URL</label>
              <input 
                value={formData.photo_url} 
                onChange={(e) => setFormData({...formData, photo_url: e.target.value})} 
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" 
                placeholder="https://example.com/image.jpg" 
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Video URL</label>
              <input 
                value={formData.video_url} 
                onChange={(e) => setFormData({...formData, video_url: e.target.value})} 
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" 
                placeholder="YouTube URL or direct .mp4 link" 
              />
              <p className="text-xs text-muted-foreground mt-2">Supports YouTube links or direct .mp4 video files.</p>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description *</label>
            <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-32" placeholder="Describe the goals and activities of this program..." />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</> : "Update Program"}
        </button>
      </form>
    </div>
  );
}