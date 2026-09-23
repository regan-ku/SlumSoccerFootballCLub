"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, Users, Trophy, Calendar, Image, LogOut, Shield, 
  Briefcase, Target, Newspaper, Settings, Menu, X
} from "lucide-react";

// Grouped Navigation Structure
const navGroups = [
  {
    title: "Club Management",
    items: [
      { name: "Players", href: "/admin/club/players", icon: <Users className="w-4 h-4" /> },
      { name: "Teams", href: "/admin/club/teams", icon: <Trophy className="w-4 h-4" /> },
      { name: "Staff", href: "/admin/club/staff", icon: <Briefcase className="w-4 h-4" /> },
      { name: "Programs", href: "/admin/club/programs", icon: <Target className="w-4 h-4" /> },
    ]
  },
  {
    title: "League Operations",
    items: [
      { name: "Divisions", href: "/admin/league/divisions", icon: <Trophy className="w-4 h-4" /> },
      { name: "Matches & Results", href: "/admin/league/matches", icon: <Calendar className="w-4 h-4" /> },
    ]
  },
  {
    title: "Content & Settings",
    items: [
      { name: "Gallery", href: "/admin/content/gallery", icon: <Image className="w-4 h-4" /> },
      { name: "News & Updates", href: "/admin/content/updates", icon: <Newspaper className="w-4 h-4" /> },
      { name: "Organization", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile drawer
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      } else {
        router.push("/login"); // Updated to match the clean login route
      }
    };
    getUser();
  }, [router]);

  // Automatically close the mobile menu when the user navigates to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login"); // Updated to match the clean login route
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* Mobile Overlay (Dark background when menu is open) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar (Slide-out on mobile, fixed on desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col 
        transform transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Logo Area */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 bg-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-heading text-lg font-bold uppercase tracking-wider text-foreground">
              Admin Panel
            </span>
          </Link>
          {/* Close button for mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-4">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border mt-auto">
          <p className="text-xs text-muted-foreground mb-3 truncate px-2">
            <span className="text-foreground font-medium">{userEmail || "Loading..."}</span>
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 min-h-screen md:ml-64 transition-all duration-300">
        
        {/* Mobile Top Bar (Hamburger Menu) */}
        <div className="md:hidden mb-6 flex items-center justify-between border-b border-border pb-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2 text-foreground hover:text-accent transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-heading text-lg font-bold uppercase tracking-wider text-foreground">
            Dashboard
          </span>
          <div className="w-10" /> {/* Spacer to keep title visually centered */}
        </div>

        {children}
      </main>
    </div>
  );
}