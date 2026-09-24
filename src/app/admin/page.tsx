"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, Trophy, Calendar, PlusCircle, Briefcase, Target, 
  Image, Newspaper, Award, Settings, Loader2 
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    players: 0,
    squads: 0,
    matches: 0,
    programs: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const supabase = createClient();

      // Fetch all counts in parallel for maximum speed
      const [playersRes, squadsRes, matchesRes, programsRes] = await Promise.all([
        // 1. Active Players
        supabase
          .from("internal_players")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        
        // 2. Active Squads (Age Groups * 2 for Boys/Girls)
        supabase
          .from("age_groups")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),

        // 3. Upcoming/Scheduled Matches
        supabase
          .from("league_fixtures")
          .select("*", { count: "exact", head: true })
          .eq("status", "scheduled"),

        // 4. Active Programs
        supabase
          .from("programs")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      // Calculate Squads (Each Age Group has a Boys and Girls squad)
      const squadsCount = (squadsRes.count || 0) * 2;

      setStats({
        players: playersRes.count || 0,
        squads: squadsCount,
        matches: matchesRes.count || 0,
        programs: programsRes.count || 0,
      });

      setLoading(false);
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard metrics..." />;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back. Manage your club, league, and community programs from here.
        </p>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{stats.players}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Players</p>
        </div>

        <div className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{stats.squads}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Squads (Boys/Girls)</p>
        </div>

        <div className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{stats.matches}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Upcoming Matches</p>
        </div>

        <div className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{stats.programs}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Programs</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Club Actions */}
          <Link href="/admin/club/players/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <PlusCircle className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Add Player</span>
          </Link>

          <Link href="/admin/club/staff" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Briefcase className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Manage Staff</span>
          </Link>

          <Link href="/admin/club/programs/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <PlusCircle className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">New Program</span>
          </Link>

          {/* League Actions */}
          <Link href="/admin/league/competitions" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Award className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">New Competition</span>
          </Link>

          <Link href="/admin/league/matches" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Calendar className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Record Result</span>
          </Link>

          {/* Content Actions */}
          <Link href="/admin/content/gallery/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Image className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Gallery</span>
          </Link>

          <Link href="/admin/content/updates/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Newspaper className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Post News</span>
          </Link>
          
          <Link href="/admin/details" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Settings className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Club Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}