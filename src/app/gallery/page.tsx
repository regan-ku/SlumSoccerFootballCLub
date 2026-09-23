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
          id, title, description, type, url, thumbnail_url, category,
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

  // Helper to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="section-padding relative z-10 text-center">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-6">
            Our <span className="text-accent">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Capturing moments of triumph, growth, and community spirit.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section-padding bg-background border-b border-border sticky top-20 z-20">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat === "All" ? "All Media" : formatCategory(cat)}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding bg-background">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading gallery...</div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No media found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative aspect-square bg-card border border-border overflow-hidden cursor-pointer hover:border-accent transition-all duration-300"
              >
                {/* Media Display */}
                {item.type === 'video' ? (
                  <>
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-16 h-16 text-accent" />
                    </div>
                  </>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider border rounded-sm ${
                      CATEGORY_COLORS[item.category] || "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {formatCategory(item.category)}
                  </span>
                </div>

                {/* Type Badge */}
                {item.type === 'video' && (
                  <div className="absolute top-3 right-3 bg-black/70 text-accent text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                    Video
                  </div>
                )}

                {/* Title Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="font-heading text-sm font-bold uppercase text-foreground mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-foreground hover:text-accent transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Media Display */}
            <div className="bg-card border border-border p-4 mb-4">
              {selectedMedia.type === 'video' ? (
                getYouTubeEmbedUrl(selectedMedia.url) ? (
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedMedia.url)!}
                      title={selectedMedia.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video controls className="w-full aspect-video">
                    <source src={selectedMedia.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="w-full h-auto"
                />
              )}
            </div>

            {/* Media Info */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-heading text-2xl font-bold uppercase text-foreground">{selectedMedia.title}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider border rounded-sm ${
                    CATEGORY_COLORS[selectedMedia.category] || "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {formatCategory(selectedMedia.category)}
                </span>
              </div>
              
              {selectedMedia.description && (
                <p className="text-muted-foreground mb-4">{selectedMedia.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                {selectedMedia.age_groups?.name && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>{selectedMedia.age_groups.name}</span>
                  </div>
                )}
                {selectedMedia.internal_teams?.name && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>{selectedMedia.internal_teams.name}</span>
                  </div>
                )}
                {selectedMedia.programs?.name && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{selectedMedia.programs.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(selectedMedia.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}