"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit3, Loader2, X, PlayCircle, Image as ImageIcon } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

const CATEGORIES = [
  "training", "match", "community", 
  "life_skills", "outreach", "events", "celebrations"
];

const CATEGORY_COLORS: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-500",
  match: "bg-green-500/10 text-green-500",
  community: "bg-purple-500/10 text-purple-500",
  life_skills: "bg-yellow-500/10 text-yellow-500",
  outreach: "bg-red-500/10 text-red-500",
  events: "bg-pink-500/10 text-pink-500",
  celebrations: "bg-accent/10 text-accent",
};

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "", description: "", type: "photo", url: "", thumbnail_url: "",
    category: "training", age_group_id: "", team_id: "", program_id: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: galleryData } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      const { data: agData } = await supabase.from("age_groups").select("id, name").eq("is_active", true);
      const { data: teamData } = await supabase.from("internal_teams").select("id, name").eq("is_active", true);
      const { data: progData } = await supabase.from("programs").select("id, name").eq("is_active", true);

      if (galleryData) setGallery(galleryData);
      if (agData) setAgeGroups(agData);
      if (teamData) setTeams(teamData);
      if (progData) setPrograms(progData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const openForm = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title || "", description: item.description || "", type: item.type || "photo",
        url: item.url || "", thumbnail_url: item.thumbnail_url || "", category: item.category || "training",
        age_group_id: item.age_group_id || "", team_id: item.team_id || "", program_id: item.program_id || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "", description: "", type: "photo", url: "", thumbnail_url: "",
        category: "training", age_group_id: "", team_id: "", program_id: ""
      });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      ...formData,
      age_group_id: formData.age_group_id || null,
      team_id: formData.team_id || null,
      program_id: formData.program_id || null,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("gallery").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("gallery").insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setEditingId(null);
      const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      if (data) setGallery(data);
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this media permanently?")) return;
    const supabase = createClient();
    await supabase.from("gallery").delete().eq("id", id);
    setGallery(gallery.filter(item => item.id !== id));
  };

  const formatCategory = (cat: string) => cat.replace('_', ' ').toUpperCase();

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload and manage photos and videos from club activities.</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Media
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                {editingId ? "Edit Media" : "Add New Media"}
              </h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, type: "photo"})} className={`p-3 border text-sm font-bold uppercase flex items-center justify-center gap-2 ${formData.type === 'photo' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>
                  <ImageIcon className="w-4 h-4" /> Photo
                </button>
                <button type="button" onClick={() => setFormData({...formData, type: "video"})} className={`p-3 border text-sm font-bold uppercase flex items-center justify-center gap-2 ${formData.type === 'video' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>
                  <PlayCircle className="w-4 h-4" /> Video
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title *</label>
                <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category *</label>
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{formatCategory(cat)}</option>)}
                </select>
              </div>

              {/* NEW: Conditional Media Upload */}
              {formData.type === 'photo' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Upload Photo (Max 5MB)</label>
                  <FileUpload 
                    bucketName="club-media" 
                    folder="gallery/photos" 
                    value={formData.url} 
                    onChange={(url) => setFormData({...formData, url})} 
                    accept="image/*"
                    maxSizeMB={5}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Upload Video File (Max 50MB)</label>
                    <FileUpload 
                      bucketName="club-media" 
                      folder="gallery/videos" 
                      value={formData.url} 
                      onChange={(url) => setFormData({...formData, url})} 
                      accept="video/mp4,video/webm"
                      maxSizeMB={50}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">OR Paste YouTube URL</label>
                    <input 
                      value={formData.url.includes("youtube.com") || formData.url.includes("youtu.be") ? formData.url : ""} 
                      onChange={(e) => setFormData({...formData, url: e.target.value})} 
                      className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" 
                      placeholder="https://youtube.com/..." 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Video Thumbnail (Optional, Max 5MB)</label>
                    <FileUpload 
                      bucketName="club-media" 
                      folder="gallery/thumbnails" 
                      value={formData.thumbnail_url} 
                      onChange={(url) => setFormData({...formData, thumbnail_url: url})} 
                      accept="image/*"
                      maxSizeMB={5}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Age Group</label>
                  <select value={formData.age_group_id} onChange={(e) => setFormData({...formData, age_group_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                    <option value="">None</option>
                    {ageGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Team</label>
                  <select value={formData.team_id} onChange={(e) => setFormData({...formData, team_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                    <option value="">None</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Program</label>
                  <select value={formData.program_id} onChange={(e) => setFormData({...formData, program_id: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                    <option value="">None</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Media" : "Add Media")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Grid (Unchanged) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-12">Loading...</p>
        ) : gallery.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">No media uploaded yet.</p>
        ) : (
          gallery.map((item) => (
            <div key={item.id} className="bg-card border border-border group relative">
              <div className="aspect-square relative overflow-hidden">
                {item.type === 'video' ? (
                  item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openForm(item)} className="p-2 bg-accent text-accent-foreground rounded-sm"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white rounded-sm"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${CATEGORY_COLORS[item.category]}`}>
                    {formatCategory(item.category)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-heading text-sm font-bold uppercase text-foreground truncate">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}