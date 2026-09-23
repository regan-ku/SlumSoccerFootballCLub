"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Target, Calendar, MapPin, Users, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  life_skills: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  community_outreach: "bg-green-500/10 text-green-500 border-green-500/20",
  education: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  health: "bg-red-500/10 text-red-500 border-red-500/20",
  mentorship: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  training: "bg-accent/10 text-accent border-accent/20",
  player_development: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

const ALL_CATEGORIES = ["All", ...Object.keys(CATEGORY_COLORS)];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("programs")
        .select(`
          id, name, category, description, target_age_min, target_age_max,
          schedule, location, photo_url, video_url, media_type,
          staff!coordinator_id (full_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) setPrograms(data);
      setLoading(false);
    };
    fetchPrograms();
  }, []);

  const filteredPrograms = selectedCategory === "All"
    ? programs
    : programs.filter(p => p.category === selectedCategory);

  const formatCategory = (cat: string) => cat.replace('_', ' ');

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
            Our <span className="text-accent">Programs</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Beyond football, we empower youth through education, life skills, and community development initiatives.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section-padding bg-background border-b border-border">
        <div className="flex flex-wrap justify-center gap-3">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat === "All" ? "All Programs" : formatCategory(cat)}
            </button>
          ))}
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding bg-background">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading programs...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No programs found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="group bg-card border border-border overflow-hidden hover:border-accent transition-all duration-300 flex flex-col"
              >
                {/* Program Media (Image or Video) */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {program.media_type === 'video' && program.video_url ? (
                    <>
                      {getYouTubeEmbedUrl(program.video_url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(program.video_url)!}
                          title={program.name}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          controls
                          className="w-full h-full object-cover"
                          poster={program.photo_url || undefined}
                        >
                          <source src={program.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-16 h-16 text-accent" />
                      </div>
                    </>
                  ) : (
                    <>
                      {program.photo_url ? (
                        <img
                          src={program.photo_url}
                          alt={program.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Target className="w-12 h-12" />
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 uppercase tracking-wider border rounded-sm ${
                        CATEGORY_COLORS[program.category] || "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {formatCategory(program.category)}
                    </span>
                  </div>

                  {/* Video Indicator */}
                  {program.media_type === 'video' && (
                    <div className="absolute top-4 right-4 bg-black/70 text-accent text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Video
                    </div>
                  )}
                </div>

                {/* Program Details */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-heading text-2xl font-bold uppercase text-foreground mb-3 group-hover:text-accent transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                    {program.description}
                  </p>

                  <div className="space-y-3 text-sm text-muted-foreground mb-6">
                    {program.schedule && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{program.schedule}</span>
                      </div>
                    )}
                    {program.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{program.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>Ages {program.target_age_min} - {program.target_age_max}</span>
                    </div>
                    {program.staff?.full_name && (
                      <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <span className="text-xs uppercase tracking-wider">Coordinator:</span>
                        <span className="text-foreground font-medium">{program.staff.full_name}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/programs/${program.id}`}
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent hover:text-foreground transition-colors group/link"
                  >
                    Learn More
                    <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}