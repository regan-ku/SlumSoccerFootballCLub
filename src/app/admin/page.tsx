"use client";

import Link from "next/link";
import { 
  Users, Trophy, Calendar, PlusCircle, Briefcase, Target, 
  Image, Newspaper, TrendingUp 
} from "lucide-react";

export default function AdminDashboard() {
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

      {/* Quick Stats (Placeholders - will be connected to DB counts in Day 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-accent" />
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">--</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Players</p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-6 h-6 text-accent" />
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">--</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Teams</p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-6 h-6 text-accent" />
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">--</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Upcoming Matches</p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-6 h-6 text-accent" />
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">--</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Programs</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Club Actions */}
          <Link href="/admin/club/players/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <PlusCircle className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Add Player</span>
          </Link>

          <Link href="/admin/club/staff/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <PlusCircle className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Add Staff</span>
          </Link>

          <Link href="/admin/club/programs/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <PlusCircle className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">New Program</span>
          </Link>

          {/* League Actions */}
          <Link href="/admin/league/matches/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Calendar className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Record Result</span>
          </Link>

          {/* Content Actions */}
          <Link href="/admin/content/gallery/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Image className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Upload Media</span>
          </Link>

          <Link href="/admin/content/updates/new" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Newspaper className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Post News</span>
          </Link>
          
          <Link href="/admin/settings" className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col items-center text-center group">
            <Trophy className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-3 transition-colors" />
            <span className="font-bold uppercase text-xs text-foreground">Club Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}