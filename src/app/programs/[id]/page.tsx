"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Calendar, MapPin, Users, PlayCircle, Target } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  life_skills: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  community_outreach: "bg-green-500/10 text-green-500 border-green-500/20",
  education: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  health: "bg-red-500/10 text-red-500 border-red-500/20",
  mentorship: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  training: "bg-accent/10 text-accent border-accent/20",
  player_development: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export default function ProgramDetailPage() {
  const params = useParams();
  const progId = params.id as string;
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("programs")
        .select(`
          id, name, category, description, target_age_min, target_age_max,
          schedule, location, media_urls, media_type,
          staff!coordinator_id (full_name)
        `)
        .eq("id", progId)
        .eq("is_active", true)
        .single();

      if (!error && data) setProgram(data);
      setLoading(false);
    };
    fetchProgram();
  }, [progId]);

  const formatCategory = (cat: string) => cat.replace('_', ' ');

  if (loading) {
    return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading program details...</div>;
  }

  if (!program) {
    return (
      <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">
        <p className="font-heading text-2xl uppercase mb-4">Program not found</p>
        <Link href="/programs" className="text-accent hover:underline">Back to Programs</Link>
      </div>
    );
  }

  // Safely handle media_urls whether it's a string or an array
  const mediaUrls = Array.isArray(program.media_urls) ? program.media_urls : (program.media_urls ? [program.media_urls] : []);

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <section className="bg-card border-b border-border py-8">
        <div className="section-padding">
          <Link href="/programs" className="inline-flex items-center text-muted-foreground hover:text-accent mb-6 transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Programs
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 uppercase tracking-wider border rounded-sm ${CATEGORY_COLORS[program.category] || "bg-muted text-muted-foreground border-border"}`}>
              {formatCategory(program.category)}
            </span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-foreground mb-4">
            {program.name}
          </h1>
        </div>
      </section>

      <div className="section-padding grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-accent" /> About This Program
            </h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
              {program.description}
            </div>
          </div>

          {/* Media Gallery */}
          {mediaUrls.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-accent" /> Program Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mediaUrls.map((url: string, idx: number) => {
                  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
                  return (
                    <div key={idx} className="aspect-video bg-muted border border-border rounded-sm overflow-hidden">
                      {program.media_type === 'video' && isYoutube ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]}`}
                          title="Program Video"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <img src={url} alt={`Program media ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Details */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-6 sticky top-24 space-y-6">
            <h3 className="font-heading text-xl font-bold uppercase text-foreground border-b border-border pb-4">
              Program Details
            </h3>
            
            <div className="space-y-5">
              {program.schedule && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Schedule</p>
                    <p className="text-foreground font-medium">{program.schedule}</p>
                  </div>
                </div>
              )}
              
              {program.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground font-medium">{program.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Target Age</p>
                  <p className="text-foreground font-medium">{program.target_age_min} - {program.target_age_max} Years Old</p>
                </div>
              </div>

              {program.staff?.full_name && (
                <div className="flex items-start gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold text-sm">{program.staff.full_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Coordinator</p>
                    <p className="text-foreground font-medium">{program.staff.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            <Link href="/contact" className="btn-primary w-full text-center block mt-4">
              Join This Program
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}