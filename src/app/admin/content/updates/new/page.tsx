"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Newspaper, Edit3, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import MultiFileUpload from "@/components/ui/MultiFileUpload"; // <-- IMPORT MULTI UPLOAD

const UPDATE_TYPES = ["news", "achievement", "announcement", "development"];

type UpdateFormState = {
  title: string;
  content: string;
  type: string;
  featured_image_urls: string[]; // Changed to array
  is_published: boolean;
};

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<UpdateFormState>({
    title: "", content: "", type: "news", featured_image_urls: [], is_published: false
  });

  useEffect(() => { fetchUpdates(); }, []);

  const fetchUpdates = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("updates").select("*").order("created_at", { ascending: false });
    if (data) setUpdates(data);
    setLoading(false);
  };

  const openForm = (update: any = null) => {
    if (update) {
      setEditingId(update.id);
      const existingImages = Array.isArray(update.featured_image_url) ? update.featured_image_url : (update.featured_image_url ? [update.featured_image_url] : []);
      setFormData({
        title: update.title, content: update.content, type: update.type, 
        featured_image_urls: existingImages, is_published: update.is_published
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", content: "", type: "news", featured_image_urls: [], is_published: false });
    }
    setErrors({});
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Basic validation
    if (!formData.title || !formData.content) {
      setErrors({ title: "Title is required", content: "Content is required" });
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const payload = {
      ...formData,
      featured_image_url: formData.featured_image_urls, // Save as array
      published_at: formData.is_published ? new Date().toISOString() : null
    };
    
    let error;
    if (editingId) {
      const res = await supabase.from("updates").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("updates").insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      fetchUpdates();
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this update permanently?")) return;
    const supabase = createClient();
    await supabase.from("updates").delete().eq("id", id);
    fetchUpdates();
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-accent" />
          <div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">News & Updates</h1>
            <p className="text-muted-foreground text-sm mt-1">Publish news, achievements, and announcements to the public site.</p>
          </div>
        </div>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post News
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">{editingId ? "Edit Update" : "New Update"}</h2>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title *</label>
                <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent ${errors.title ? 'border-red-500' : 'border-border'}`} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Type *</label>
                  <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent">
                    {UPDATE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer bg-background border border-border p-3 w-full">
                    <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-4 h-4 accent-accent" />
                    <span className="text-sm font-bold uppercase text-foreground">Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Featured Images (Max 5 files)</label>
                <MultiFileUpload 
                  bucketName="club-media" 
                  folder="updates" 
                  values={formData.featured_image_urls} 
                  onChange={(urls) => setFormData({...formData, featured_image_urls: urls})} 
                  accept="image/*" 
                  maxSizeMB={5} 
                  maxFiles={5} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Content *</label>
                <textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent h-40 ${errors.content ? 'border-red-500' : 'border-border'}`} />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Update"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {loading ? <p className="text-muted-foreground text-center py-12">Loading updates...</p> : updates.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No updates posted yet.</p>
        ) : (
          updates.map((update) => {
            const displayImage = Array.isArray(update.featured_image_url) ? update.featured_image_url[0] : update.featured_image_url;
            
            return (
              <div key={update.id} className="bg-card border border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 flex gap-4">
                  {displayImage && (
                    <img src={displayImage} alt="" className="w-16 h-16 object-cover rounded-sm border border-border flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${update.is_published ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        {update.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider bg-muted text-muted-foreground rounded-sm">
                        {update.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-bold uppercase text-foreground">{update.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{update.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openForm(update)} className="p-2 text-muted-foreground hover:text-accent transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(update.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}