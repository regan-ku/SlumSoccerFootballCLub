"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Trash2, Loader2, Save, AlertCircle } from "lucide-react";
import { z } from "zod";

// Inline Schema for Match Recording
const matchSchema = z.object({
  home_score: z.coerce.number().min(0, "Score cannot be negative"),
  away_score: z.coerce.number().min(0, "Score cannot be negative"),
  status: z.enum(["scheduled", "played", "postponed", "cancelled"]),
});
type MatchFormData = z.infer<typeof matchSchema>;

export default function RecordMatchPage() {
  const router = useRouter();
  const params = useParams();
  const fixtureId = params.id as string;

  const [fixture, setFixture] = useState<any>(null);
  const [homePlayers, setHomePlayers] = useState<any[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MatchFormData>({ home_score: 0, away_score: 0, status: "scheduled" });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: fixData } = await supabase.from("league_fixtures").select("*, home_team:league_teams!home_team_id(id, name), away_team:league_teams!away_team_id(id, name)").eq("id", fixtureId).single();

      if (fixData) {
        setFixture(fixData);
        setFormData({
          home_score: fixData.home_score || 0,
          away_score: fixData.away_score || 0,
          status: fixData.status || "scheduled"
        });

        const { data: hPlayers } = await supabase.from("league_players").select("id, full_name, jersey_number").eq("team_id", fixData.home_team.id).eq("is_active", true).order("jersey_number", { ascending: true });
        const { data: aPlayers } = await supabase.from("league_players").select("id, full_name, jersey_number").eq("team_id", fixData.away_team.id).eq("is_active", true).order("jersey_number", { ascending: true });

        if (hPlayers) setHomePlayers(hPlayers);
        if (aPlayers) setAwayPlayers(aPlayers);

        if (fixData.status === 'played') {
          const { data: eventData } = await supabase.from("league_match_events").select("*").eq("fixture_id", fixtureId).order("minute", { ascending: true });
          if (eventData) setEvents(eventData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [fixtureId]);

  const addEvent = () => {
    setEvents([...events, { id: crypto.randomUUID(), minute: "", player_id: "", event_type: "goal", related_player_id: "" }]);
  };

  const updateEvent = (id: string, field: string, value: any) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const supabase = createClient();

    // 1. VALIDATE SCORES & STATUS
    const result = matchSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
      setErrors(fieldErrors);
      setSaving(false);
      return;
    }

    try {
      // 2. UPDATE FIXTURE
      await supabase.from("league_fixtures").update({
        home_score: result.data.home_score,
        away_score: result.data.away_score,
        status: result.data.status,
        played_at: result.data.status === 'played' ? new Date().toISOString() : null
      }).eq("id", fixtureId);

      // 3. REPLACE EVENTS
      await supabase.from("league_match_events").delete().eq("fixture_id", fixtureId);
      if (events.length > 0) {
        const cleanEvents = events.map(ev => ({
          fixture_id: fixtureId,
          player_id: ev.player_id || null,
          event_type: ev.event_type,
          minute: ev.minute ? parseInt(ev.minute) : null,
          related_player_id: ev.related_player_id || null
        }));
        await supabase.from("league_match_events").insert(cleanEvents);
      }
      
      router.push("/admin/league/matches");
    } catch (error: any) {
      alert("Error saving match: " + error.message);
      setSaving(false);
    }
  };

  if (loading || !fixture) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading match details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Matches
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Record Match Result</h1>
        <p className="text-muted-foreground text-sm mt-1">{fixture.home_team.name} vs {fixture.away_team.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border p-6 md:p-8">
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-6 border-b border-border pb-2">Final Score & Status</h3>
          
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-bold text-sm uppercase">Please fix the score errors below.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground uppercase mb-1">{fixture.home_team.name}</p>
              {/* FIXED: Convert string input to Number */}
              <input type="number" min="0" value={formData.home_score} onChange={(e) => setFormData({...formData, home_score: Number(e.target.value) || 0})}
                className={`w-full md:w-24 text-center bg-background border p-3 text-3xl font-heading font-bold text-foreground focus:outline-none focus:border-accent ${errors.home_score ? 'border-red-500' : 'border-border'}`} />
              {errors.home_score && <p className="text-red-500 text-xs mt-1">{errors.home_score}</p>}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase mb-2">Match Status</p>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent uppercase font-bold ${errors.status ? 'border-red-500' : 'border-border'}`}>
                <option value="scheduled">Scheduled</option>
                <option value="played">Played</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
            </div>

            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase mb-1">{fixture.away_team.name}</p>
              {/* FIXED: Convert string input to Number */}
              <input type="number" min="0" value={formData.away_score} onChange={(e) => setFormData({...formData, away_score: Number(e.target.value) || 0})}
                className={`w-full md:w-24 text-center bg-background border p-3 text-3xl font-heading font-bold text-foreground focus:outline-none focus:border-accent ${errors.away_score ? 'border-red-500' : 'border-border'}`} />
              {errors.away_score && <p className="text-red-500 text-xs mt-1">{errors.away_score}</p>}
            </div>
          </div>
        </div>

        {/* Match Events */}
        <div className="bg-card border border-border p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-heading text-xl font-bold uppercase text-accent">Match Events</h3>
            <button type="button" onClick={addEvent} className="text-xs font-bold uppercase text-accent hover:text-foreground flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No events recorded. Click "Add Event" to log goals, cards, etc.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="grid grid-cols-12 gap-2 items-center bg-background p-3 border border-border">
                  <div className="col-span-2">
                    <input type="number" placeholder="Min" value={ev.minute} onChange={(e) => updateEvent(ev.id, "minute", e.target.value)} className="w-full bg-card border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent" />
                  </div>
                  <div className="col-span-3">
                    <select value={ev.player_id} onChange={(e) => updateEvent(ev.id, "player_id", e.target.value)} className="w-full bg-card border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent">
                      <option value="">Select Player</option>
                      <optgroup label={fixture.home_team.name}>{homePlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}</optgroup>
                      <optgroup label={fixture.away_team.name}>{awayPlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}</optgroup>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <select value={ev.event_type} onChange={(e) => updateEvent(ev.id, "event_type", e.target.value)} className="w-full bg-card border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent uppercase font-bold">
                      <option value="goal">⚽ Goal</option><option value="assist">👟 Assist</option><option value="yellow_card">🟨 Yellow Card</option>
                      <option value="red_card">🟥 Red Card</option><option value="substitution_in">🟩 Sub In</option><option value="substitution_out">🟥 Sub Out</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                     <select value={ev.related_player_id} onChange={(e) => updateEvent(ev.id, "related_player_id", e.target.value)} className="w-full bg-card border border-border p-2 text-xs text-muted-foreground focus:outline-none focus:border-accent">
                      <option value="">Related (Assist/Sub)</option>
                      {homePlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}
                      {awayPlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button type="button" onClick={() => removeEvent(ev.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Match Data...</> : <><Save className="w-4 h-4" /> Save Match Result</>}
        </button>
      </form>
    </div>
  );
}