"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Calendar, Users, Loader2, X, Shuffle, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [internalTeams, setInternalTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [compType, setCompType] = useState<"tournament" | "friendly">("tournament");
  const [compName, setCompName] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  
  const [selectedInternalIds, setSelectedInternalIds] = useState<string[]>([]);
  const [externalTeams, setExternalTeams] = useState<string[]>([]);
  const [newExternalTeam, setNewExternalTeam] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: compData } = await supabase.from("competitions").select("*").eq("is_active", true).order("start_date", { ascending: true });
      const { data: teamData } = await supabase.from("internal_teams").select("id, name").eq("is_active", true).order("name");
      
      if (compData) setCompetitions(compData);
      if (teamData) setInternalTeams(teamData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const addExternalTeam = () => {
    if (newExternalTeam.trim() && !externalTeams.includes(newExternalTeam.trim())) {
      setExternalTeams([...externalTeams, newExternalTeam.trim()]);
      setNewExternalTeam("");
    }
  };

  const handleCreateCompetition = async () => {
    if (!compName || (selectedInternalIds.length === 0 && externalTeams.length === 0)) {
      alert("Please provide a name and select at least 1 team.");
      return;
    }

    const supabase = createClient();
    const { data: compData, error: compError } = await supabase
      .from("competitions")
      .insert([{ 
        name: compName, 
        type: compType, 
        season: new Date().getFullYear().toString(),
        description: compDesc,
        start_date: startDate || null,
        registration_deadline: regDeadline || null
      }])
      .select()
      .single();

    if (compError || !compData) {
      alert("Error creating competition: " + compError?.message);
      return;
    }

    // Link Internal Teams
    if (selectedInternalIds.length > 0) {
      const internalLinks = selectedInternalIds.map(teamId => ({ 
        competition_id: compData.id, 
        team_id: teamId,
        is_external: false
      }));
      await supabase.from("competition_teams").insert(internalLinks);
    }

    // Link External Teams
    if (externalTeams.length > 0) {
      const externalLinks = externalTeams.map(extName => ({ 
        competition_id: compData.id, 
        external_team_name: extName,
        is_external: true
      }));
      await supabase.from("competition_teams").insert(externalLinks);
    }

    setShowModal(false);
    setCompName(""); setCompDesc(""); setStartDate(""); setRegDeadline("");
    setSelectedInternalIds([]); setExternalTeams([]);
    
    const { data: updatedComps } = await supabase.from("competitions").select("*").eq("is_active", true).order("start_date", { ascending: true });
    if (updatedComps) setCompetitions(updatedComps);
  };

  const isRegistrationOpen = (deadline: string | null) => {
    if (!deadline) return true;
    return new Date(deadline) > new Date();
  };

  if (loading) return <div className="section-padding text-center text-muted-foreground pt-20">Loading competitions...</div>;

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Competitions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage Tournaments and Friendly matches.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Competition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">No active competitions. Create one to get started.</p>
        ) : (
          competitions.map((comp) => {
            const regOpen = isRegistrationOpen(comp.registration_deadline);
            return (
              <div key={comp.id} className="bg-card border border-border p-6 hover:border-accent transition-colors flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${
                    comp.type === 'tournament' ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {comp.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1 ${regOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    <Clock className="w-3 h-3" /> {regOpen ? 'Reg. Open' : 'Reg. Closed'}
                  </span>
                </div>
                
                <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2">{comp.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">{comp.description || "No description provided."}</p>
                
                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  {comp.start_date && <p><span className="font-bold text-foreground">Starts:</span> {new Date(comp.start_date).toLocaleDateString()}</p>}
                  {comp.registration_deadline && <p><span className="font-bold text-foreground">Reg. Deadline:</span> {new Date(comp.registration_deadline).toLocaleDateString()}</p>}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link href={`/admin/league/matches?compId=${comp.id}`} className="flex-1 text-center px-3 py-2 text-xs font-bold uppercase bg-muted hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm">
                    View Matches
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Competition Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-foreground">New Competition</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setCompType("tournament")} className={`p-3 border text-sm font-bold uppercase ${compType === 'tournament' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>Tournament</button>
                  <button onClick={() => setCompType("friendly")} className={`p-3 border text-sm font-bold uppercase ${compType === 'friendly' ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground'}`}>Friendlies</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Competition Name *</label>
                <input value={compName} onChange={(e) => setCompName(e.target.value)} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g., Pre-Season Cup 2024" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea value={compDesc} onChange={(e) => setCompDesc(e.target.value)} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-20" placeholder="Brief details about the competition..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Registration Deadline</label>
                  <input type="date" value={regDeadline} onChange={(e) => setRegDeadline(e.target.value)} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" />
                  <p className="text-[10px] text-muted-foreground mt-1">e.g., 1 week before start for tournaments, 1 month for leagues.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Internal Teams</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-border p-2 rounded-sm bg-background">
                  {internalTeams.map(team => (
                    <label key={team.id} className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer rounded-sm">
                      <input type="checkbox" checked={selectedInternalIds.includes(team.id)} onChange={(e) => {
                        if (e.target.checked) setSelectedInternalIds([...selectedInternalIds, team.id]);
                        else setSelectedInternalIds(selectedInternalIds.filter(id => id !== team.id));
                      }} className="accent-accent" />
                      <span className="text-sm text-foreground">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">External Teams</label>
                <div className="flex gap-2 mb-2">
                  <input value={newExternalTeam} onChange={(e) => setNewExternalTeam(e.target.value)} className="flex-1 bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent" placeholder="e.g., City Rovers FC" />
                  <button onClick={addExternalTeam} className="px-4 bg-muted hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {externalTeams.map((team, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs font-bold uppercase rounded-sm">
                      {team}
                      <button onClick={() => setExternalTeams(externalTeams.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={handleCreateCompetition} className="btn-primary w-full flex justify-center mt-4">
                Create Competition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}