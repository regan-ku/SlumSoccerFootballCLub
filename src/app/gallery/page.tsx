"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Filter, PlayCircle, X, Calendar, Users } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  match: "bg-green-500/10 text-green-500 border-green-500/20",
  community: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  life_skills: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  outreach: "bg-red-500/10 text-red-500 border-red-500/20",
  events: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  celebrations: "bg-accent/10 text-accent border-accent/20",
};

const ALL_CATEGORIES = ["All", ...Object.keys(CATEGORY_COLORS)];

export default function GalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gallery")
        .select(`
          id, title, description, type, url, thumbnail_url, category, created_at,
          age_groups (name), internal_teams (name), programs (name)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) setGallery(data);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const filteredGallery = selectedCategory === "All"
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  const formatCategory = (cat: string) => cat.replace('_', ' ').toUpperCase();

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <section className="bg-card border-b border-border py-8">
        <div className="section-padding flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight">
              Media <span className="text-accent">Gallery</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Capturing moments of triumph, growth, and community spirit.</p>
          </div>
          
          {/* Compact, Scrollable Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-sm whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "All" : formatCategory(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dense Media Grid */}
      <section className="section-padding">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading gallery...</div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">No media found in this category.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredGallery.map((item) => {
              // Handle array or string for url (backward compatibility)
              const displayUrl = Array.isArray(item.url) ? item.url[0] : item.url;
              
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="group relative aspect-square bg-muted border border-border overflow-hidden cursor-pointer hover:border-accent transition-all duration-300"
                >
                  {item.type === 'video' ? (
                    <>
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/20">
                          <PlayCircle className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-12 h-12 text-accent" />
                      </div>
                    </>
                  ) : (
                    <img src={displayUrl} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  )}

                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider border rounded-sm ${CATEGORY_COLORS[item.category] || "bg-muted text-muted-foreground border-border"}`}>
                      {formatCategory(item.category)}
                    </span>
                  </div>

                  {item.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/70 text-accent text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm">Video</div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="font-heading text-xs font-bold uppercase text-foreground mb-0.5 line-clamp-1">{item.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Modal (Unchanged, works perfectly) */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <button onClick={() => setSelectedMedia(null)} className="absolute top-4 right-4 text-foreground hover:text-accent transition-colors z-50">
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card border border-border p-2 md:p-4 mb-4">
              {selectedMedia.type === 'video' ? (
                getYouTubeEmbedUrl(Array.isArray(selectedMedia.url) ? selectedMedia.url[0] : selectedMedia.url) ? (
                  <div className="aspect-video">
                    <iframe src={getYouTubeEmbedUrl(Array.isArray(selectedMedia.url) ? selectedMedia.url[0] : selectedMedia.url)!} title={selectedMedia.title} className="w-full h-full" allowFullScreen />
                  </div>
                ) : (
                  <video controls className="w-full aspect-video">
                    <source src={Array.isArray(selectedMedia.url) ? selectedMedia.url[0] : selectedMedia.url} type="video/mp4" />
                  </video>
                )
              ) : (
                <img src={Array.isArray(selectedMedia.url) ? selectedMedia.url[0] : selectedMedia.url} alt={selectedMedia.title} className="w-full h-auto" />
              )}
            </div>

            <div className="bg-card border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-heading text-2xl font-bold uppercase text-foreground">{selectedMedia.title}</h2>
                <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider border rounded-sm ${CATEGORY_COLORS[selectedMedia.category]}`}>
                  {formatCategory(selectedMedia.category)}
                </span>
              </div>
              {selectedMedia.description && <p className="text-muted-foreground mb-4">{selectedMedia.description}</p>}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                {selectedMedia.age_groups?.name && <div className="flex items-center gap-2"><Users className="w-3 h-3" /><span>{selectedMedia.age_groups.name}</span></div>}
                {selectedMedia.internal_teams?.name && <div className="flex items-center gap-2"><Users className="w-3 h-3" /><span>{selectedMedia.internal_teams.name}</span></div>}
                <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /><span>{new Date(selectedMedia.created_at).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}