"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Target, Calendar, Users, ChevronRight, PlayCircle } from "lucide-react";
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
          schedule, location, media_urls, media_type,
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

  // Helper to safely get the first media item from an array or string
  const getFirstMedia = (media: any) => {
    if (Array.isArray(media)) return media[0];
    return media;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Hero Section */}
      <section className="relative bg-card border-b border-border py-12 md:py-16">
        <div className="section-padding text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Our <span className="text-accent">Programs</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Beyond football, we empower youth through education, life skills, and community development initiatives.
          </p>
        </div>
      </section>

      {/* Sticky Category Filter */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur border-b border-border py-4">
        <div className="section-padding">
          <div className="flex flex-wrap justify-center gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "All Programs" : formatCategory(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading programs...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No programs found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => {
              const firstMedia = getFirstMedia(program.media_urls);
              const isVideo = program.media_type === 'video';
              
              return (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="group bg-card border border-border overflow-hidden hover:border-accent transition-all duration-300 flex flex-col"
                >
                  {/* Program Media */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {isVideo && firstMedia ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/20">
                        <PlayCircle className="w-12 h-12 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    ) : firstMedia ? (
                      <img
                        src={firstMedia}
                        alt={program.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Target className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider border rounded-sm ${CATEGORY_COLORS[program.category] || "bg-muted text-muted-foreground border-border"}`}>
                        {formatCategory(program.category)}
                      </span>
                    </div>

                    {isVideo && (
                      <div className="absolute top-3 right-3 bg-black/70 text-accent text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" /> Video
                      </div>
                    )}
                  </div>

                  {/* Program Details */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-1">
                      {program.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-2">
                      {program.description}
                    </p>

                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                      {program.schedule && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-accent flex-shrink-0" />
                          <span className="truncate">{program.schedule}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-accent flex-shrink-0" />
                        <span>Ages {program.target_age_min} - {program.target_age_max}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent group-hover:text-foreground transition-colors mt-auto">
                      Learn More
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}