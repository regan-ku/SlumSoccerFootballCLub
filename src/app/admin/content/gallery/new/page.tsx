"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit3, Loader2, X, PlayCircle, Image as ImageIcon, AlertCircle } from "lucide-react";
import MultiFileUpload from "@/components/ui/MultiFileUpload";
import { gallerySchema } from "@/lib/validations/gallery"; 

const CATEGORIES = ["training", "match", "community", "life_skills", "outreach", "events", "celebrations"];
const CATEGORY_COLORS: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-500", 
  match: "bg-green-500/10 text-green-500", 
  community: "bg-purple-500/10 text-purple-500",
  life_skills: "bg-yellow-500/10 text-yellow-500", 
  outreach: "bg-red-500/10 text-red-500", 
  events: "bg-pink-500/10 text-pink-500", 
  celebrations: "bg-accent/10 text-accent",
};

// Local type to handle URL arrays
type GalleryFormState = {
  title: string;
  description: string;
  type: "photo" | "video";
  urls: string[]; // Array for multi-upload
  thumbnail_url: string;
  category: string;
  age_group_id: string;
  team_id: string;
  program_id: string;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<GalleryFormState>({
    title: "", description: "", type: "photo", urls: [], thumbnail_url: "",
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
      // Safely convert string or array to array
      const existingUrls = Array.isArray(item.url) ? item.url : (item.url ? [item.url] : []);
      setFormData({
        title: item.title || "", description: item.description || "", type: item.type || "photo",
        urls: existingUrls, thumbnail_url: item.thumbnail_url || "", category: item.category || "training",
        age_group_id: item.age_group_id || "", team_id: item.team_id || "", program_id: item.program_id || ""
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", type: "photo", urls: [], thumbnail_url: "", category: "training", age_group_id: "", team_id: "", program_id: "" });
    }
    setErrors({});
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // 1. Validate formData directly (schema now expects 'urls')
    const result = gallerySchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
      setErrors(fieldErrors);
      setSaving(false);
      return;
    }

    const supabase = createClient();
    
    // 2. Map the form's 'urls' array to the database's 'url' column
    const payload = {
      title: result.data.title,
      description: result.data.description || null,
      type: result.data.type,
      category: result.data.category,
      age_group_id: result.data.age_group_id || null,
      team_id: result.data.team_id || null,
      program_id: result.data.program_id || null,
      thumbnail_url: result.data.thumbnail_url || null,
      url: result.data.urls, // <-- Sends the array to the DB
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

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">{editingId ? "Edit Media" : "Add New Media"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="font-bold text-sm uppercase">Please fix the errors below.</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, type: "photo"})} className={`p-3 border text-sm font-bold uppercase flex items-center justify-center gap-2 ${formData.type === 'photo' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>
                  <ImageIcon className="w-4 h-4" /> Photo
                </button>
                <button type="button" onClick={() => setFormData({...formData, type: "video"})} className={`p-3 border text-sm font-bold uppercase flex items-center justify-center gap-2 ${formData.type === 'video' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>
                  <PlayCircle className="w-4 h-4" /> Video
                </button>
              </div>

              <Input label="Title *" required value={formData.title} error={errors.title} onChange={(v) => setFormData({...formData, title: v})} />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category *</label>
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent ${errors.category ? 'border-red-500' : 'border-border'}`}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{formatCategory(cat)}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>}
              </div>

              {formData.type === 'photo' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Upload Photos (Max 15 files, 5MB each) *</label>
                  <MultiFileUpload 
                    bucketName="club-media" 
                    folder="gallery/photos" 
                    values={formData.urls} 
                    onChange={(urls) => setFormData({...formData, urls})} 
                    accept="image/*" 
                    maxSizeMB={5} 
                    maxFiles={15} 
                  />
                  {/* FIXED: errors.urls instead of errors.url */}
                  {errors.urls && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.urls}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Upload Video File (Max 50MB) *</label>
                    <MultiFileUpload 
                      bucketName="club-media" 
                      folder="gallery/videos" 
                      values={formData.urls} 
                      onChange={(urls) => setFormData({...formData, urls})} 
                      accept="video/mp4,video/webm" 
                      maxSizeMB={50} 
                      maxFiles={15} 
                    />
                    {/* FIXED: errors.urls instead of errors.url */}
                    {errors.urls && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.urls}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Video Thumbnail (Optional, Max 5MB)</label>
                    <MultiFileUpload 
                      bucketName="club-media" 
                      folder="gallery/thumbnails" 
                      values={formData.thumbnail_url ? [formData.thumbnail_url] : []} 
                      onChange={(urls) => setFormData({...formData, thumbnail_url: urls[0] || ""})} 
                      accept="image/*" 
                      maxSizeMB={5} 
                      maxFiles={1} 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <SelectInput label="Age Group" value={formData.age_group_id} onChange={(v) => setFormData({...formData, age_group_id: v})} options={[{value: "", label: "None"}, ...ageGroups.map(ag => ({value: ag.id, label: ag.name}))]} />
                <SelectInput label="Team" value={formData.team_id} onChange={(v) => setFormData({...formData, team_id: v})} options={[{value: "", label: "None"}, ...teams.map(t => ({value: t.id, label: t.name}))]} />
                <SelectInput label="Program" value={formData.program_id} onChange={(v) => setFormData({...formData, program_id: v})} options={[{value: "", label: "None"}, ...programs.map(p => ({value: p.id, label: p.name}))]} />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Media" : "Add Media")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? <p className="text-muted-foreground col-span-full text-center py-12">Loading...</p> : gallery.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">No media uploaded yet.</p>
        ) : (
          gallery.map((item) => {
            // Handle both string and array for backward compatibility
            const displayUrl = Array.isArray(item.url) ? item.url[0] : item.url;
            
            return (
              <div key={item.id} className="bg-card border border-border group relative">
                <div className="aspect-square relative overflow-hidden">
                  {item.type === 'video' ? (
                    item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full bg-muted flex items-center justify-center"><PlayCircle className="w-12 h-12 text-muted-foreground" /></div>
                  ) : <img src={displayUrl} alt={item.title} className="w-full h-full object-cover" />}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openForm(item)} className="p-2 bg-accent text-accent-foreground rounded-sm"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white rounded-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${CATEGORY_COLORS[item.category]}`}>{formatCategory(item.category)}</span>
                  </div>
                  {Array.isArray(item.url) && item.url.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-sm">
                      +{item.url.length - 1}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-heading text-sm font-bold uppercase text-foreground truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Reusable Components
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

interface SelectProps { label: string; value: string; onChange: (value: string) => void; options: {value: string, label: string}[]; }
function SelectInput({ label, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}