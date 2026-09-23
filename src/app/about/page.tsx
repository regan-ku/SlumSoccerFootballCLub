"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Heart, Users, Target, MapPin, Mail, Phone, Calendar } from "lucide-react";

export default function AboutPage() {
  const [orgData, setOrgData] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch Organization Info
      const { data: org } = await supabase
        .from("organization")
        .select("*")
        .limit(1)
        .single();

      // Fetch Active Staff
      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (org) setOrgData(org);
      if (staffData) setStaff(staffData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen text-center text-muted-foreground py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="section-padding relative z-10 text-center">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-6">
            About <span className="text-accent">Us</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            {orgData?.tagline || "More than just football"}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="bg-card border border-border p-8 md:p-12">
            <Target className="w-12 h-12 text-accent mb-6" />
            <h2 className="font-heading text-3xl font-bold uppercase text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              {orgData?.mission || "Empowering the next generation through football, life skills, and community development."}
            </p>
          </div>
          <div className="bg-card border border-border p-8 md:p-12">
            <Trophy className="w-12 h-12 text-accent mb-6" />
            <h2 className="font-heading text-3xl font-bold uppercase text-foreground mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              {orgData?.vision || "To create a community where every child has the opportunity to thrive through sport and education."}
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section-padding bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase text-center mb-12">
            Our <span className="text-accent">Impact</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="w-8 h-8 text-accent" />, label: "Active Players", value: "100+" },
              { icon: <Trophy className="w-8 h-8 text-accent" />, label: "Teams", value: "8" },
              { icon: <Heart className="w-8 h-8 text-accent" />, label: "Community Programs", value: "5" },
              { icon: <Calendar className="w-8 h-8 text-accent" />, label: "Years Active", value: orgData?.founded_year ? `${new Date().getFullYear() - orgData.founded_year}+` : "5+" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <p className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Staff */}
      <section className="section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase text-center mb-4">
            Meet Our <span className="text-accent">Staffs</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Dedicated professionals committed to developing young talent on and off the pitch.
          </p>

          {staff.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Our coaching staff will be introduced soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.map((member) => (
                <div key={member.id} className="bg-card border border-border p-6 hover:border-accent transition-colors">
                  <div className="aspect-square bg-muted mb-6 rounded-sm overflow-hidden">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="font-heading text-6xl font-bold">
                          {member.full_name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-1">{member.full_name}</h3>
                  <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">
                    {member.role.replace("_", " ")}
                  </p>
                  {member.qualifications && (
                    <p className="text-xs text-muted-foreground mb-3 italic">"{member.qualifications}"</p>
                  )}
                  {member.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding bg-card border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase mb-4">
            Get In <span className="text-accent">Touch</span>
          </h2>
          <p className="text-muted-foreground mb-12">
            Have questions? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {orgData?.location && (
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 text-accent mb-3" />
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                <p className="text-foreground">{orgData.location}</p>
              </div>
            )}
            {orgData?.contact_email && (
              <div className="flex flex-col items-center">
                <Mail className="w-8 h-8 text-accent mb-3" />
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                <p className="text-foreground">{orgData.contact_email}</p>
              </div>
            )}
            {orgData?.contact_phone && (
              <div className="flex flex-col items-center">
                <Phone className="w-8 h-8 text-accent mb-3" />
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                <p className="text-foreground">{orgData.contact_phone}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}