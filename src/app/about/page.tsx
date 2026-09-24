"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Heart, Users, Target, MapPin, Mail, Phone, Calendar, Quote } from "lucide-react";

export default function AboutPage() {
  const [orgData, setOrgData] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: org } = await supabase.from("organization").select("*").limit(1).single();
      const { data: staffData } = await supabase.from("staff").select("*").eq("is_active", true).order("created_at", { ascending: false });

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
    <div className="min-h-screen bg-background">
      {/* Compact Hero Section */}
      <section className="relative bg-card border-b border-border py-16 md:py-24">
        <div className="section-padding text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            About <span className="text-accent">Us</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            {orgData?.tagline || "More than just football"}
          </p>
        </div>
      </section>

      {/* Mission & Vision (Tightened Grid) */}
      <section className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-card border border-border p-8">
            <Target className="w-10 h-10 text-accent mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              {orgData?.mission || "Empowering the next generation through football, life skills, and community development."}
            </p>
          </div>
          <div className="bg-card border border-border p-8">
            <Trophy className="w-10 h-10 text-accent mb-4" />
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground mb-3">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              {orgData?.vision || "To create a community where every child has the opportunity to thrive through sport and education."}
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats (More Compact) */}
      <section className="bg-card border-y border-border py-12">
        <div className="section-padding">
          <h2 className="font-heading text-3xl font-bold uppercase text-center mb-8">
            Our <span className="text-accent">Impact</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <Users className="w-6 h-6 text-accent" />, label: "Active Players", value: "100+" },
              { icon: <Trophy className="w-6 h-6 text-accent" />, label: "Teams", value: "8" },
              { icon: <Heart className="w-6 h-6 text-accent" />, label: "Programs", value: "5+" },
              { icon: <Calendar className="w-6 h-6 text-accent" />, label: "Years Active", value: orgData?.founded_year ? `${new Date().getFullYear() - orgData.founded_year}+` : "5+" },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <p className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Staff (Added Quote Support) */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase text-center mb-3">
            Meet Our <span className="text-accent">Staff</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Dedicated professionals committed to developing young talent on and off the pitch.
          </p>

          {staff.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Our coaching staff will be introduced soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <div key={member.id} className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col">
                  <div className="aspect-square bg-muted mb-4 rounded-sm overflow-hidden">
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
                  
                  {/* New Quote Display */}
                  {member.quote && (
                    <div className="mb-3 p-3 bg-accent/5 border-l-2 border-accent rounded-r-sm">
                      <Quote className="w-4 h-4 text-accent mb-1" />
                      <p className="text-sm text-foreground italic leading-snug">"{member.quote}"</p>
                    </div>
                  )}

                  {member.qualifications && (
                    <p className="text-xs text-muted-foreground mb-3 italic">"{member.qualifications}"</p>
                  )}
                  {member.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Info (Tightened) */}
      <section className="bg-card border-t border-border py-12">
        <div className="section-padding max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold uppercase mb-3">
            Get In <span className="text-accent">Touch</span>
          </h2>
          <p className="text-muted-foreground mb-8">Have questions? We'd love to hear from you.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {orgData?.location && (
              <div className="flex flex-col items-center">
                <MapPin className="w-6 h-6 text-accent mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                <p className="text-foreground text-sm">{orgData.location}</p>
              </div>
            )}
            {orgData?.contact_email && (
              <div className="flex flex-col items-center">
                <Mail className="w-6 h-6 text-accent mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${orgData.contact_email}`} className="text-foreground text-sm hover:text-accent transition-colors">{orgData.contact_email}</a>
              </div>
            )}
            {orgData?.contact_phone && (
              <div className="flex flex-col items-center">
                <Phone className="w-6 h-6 text-accent mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                <a href={`tel:${orgData.contact_phone}`} className="text-foreground text-sm hover:text-accent transition-colors">{orgData.contact_phone}</a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}