"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Target, Calendar, MapPin, Loader2, Edit3, UserX, PlayCircle } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  life_skills: "bg-blue-500/10 text-blue-500",
  community_outreach: "bg-green-500/10 text-green-500",
  education: "bg-purple-500/10 text-purple-500",
  health: "bg-red-500/10 text-red-500",
  mentorship: "bg-yellow-500/10 text-yellow-500",
  training: "bg-accent/10 text-accent",
  player_development: "bg-indigo-500/10 text-indigo-500",
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch Programs with Coordinator Name AND Media fields
      const { data: progData } = await supabase
        .from("programs")
        .select(`
          id, name, category, description, target_age_min, target_age_max, 
          schedule, location, is_active, photo_url, video_url, media_type,
          staff!coordinator_id (full_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Fetch Staff for dropdowns
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, full_name, role")
        .eq("is_active", true);

      if (progData) setPrograms(progData);
      if (staffData) setStaffList(staffData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // SOFT DELETE FUNCTION
  const handleDeactivate = async (progId: string) => {
    if (!window.confirm("Are you sure? This will hide the program from the public site but keep historical session data.")) return;
    
    setDeletingId(progId);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("programs")
      .update({ is_active: false })
      .eq("id", progId);

    if (!error) {
      setPrograms(programs.filter(p => p.id !== progId));
    } else {
      alert("Error deactivating program.");
    }
    setDeletingId(null);
  };

  const formatCategory = (cat: string) => cat.replace('_', ' ').toUpperCase();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
            Community Programs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage life skills, outreach, education, and training initiatives.
          </p>
        </div>
        <Link href="/admin/club/programs/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Program
        </Link>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-12">Loading programs...</p>
        ) : programs.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">No active programs found.</p>
        ) : (
          programs.map((prog) => (
            <div key={prog.id} className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${CATEGORY_COLORS[prog.category] || "bg-muted text-muted-foreground"}`}>
                  {formatCategory(prog.category)}
                </span>
                {/* Video Badge Indicator */}
                {prog.media_type === 'video' && (
                  <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm bg-accent/10 text-accent flex items-center gap-1">
                    <PlayCircle className="w-3 h-3" /> Video
                  </span>
                )}
              </div>
              
              <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2">{prog.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">{prog.description}</p>
              
              <div className="space-y-2 text-xs text-muted-foreground mb-6">
                {prog.schedule && (
                  <p className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {prog.schedule}</p>
                )}
                {prog.location && (
                  <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {prog.location}</p>
                )}
                <p className="flex items-center gap-2">
                  <Target className="w-3 h-3" /> Ages: {prog.target_age_min} - {prog.target_age_max}
                </p>
                <p className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                  <UserX className="w-3 h-3" /> Coordinator: <span className="text-foreground">{prog.staff?.full_name || "Unassigned"}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href={`/admin/club/programs/${prog.id}`} className="text-muted-foreground hover:text-accent transition-colors" title="Edit Program">
                  <Edit3 className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDeactivate(prog.id)} 
                  disabled={deletingId === prog.id}
                  className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50" 
                  title="Deactivate Program"
                >
                  {deletingId === prog.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}