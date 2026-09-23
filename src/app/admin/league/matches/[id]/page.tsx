"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Trash2, Loader2, Save } from "lucide-react";

export default function RecordMatchPage() {
  const router = useRouter();
  const params = useParams();
  const fixtureId = params.id as string;

  const [fixture, setFixture] = useState<any>(null);
  const [homePlayers, setHomePlayers] = useState<any[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [status, setStatus] = useState("scheduled");

  // Match Events State
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 1. Fetch Fixture
      const { data: fixData } = await supabase
        .from("league_fixtures")
        .select("*, home_team:league_teams!home_team_id(id, name), away_team:league_teams!away_team_id(id, name)")
        .eq("id", fixtureId)
        .single();

      if (fixData) {
        setFixture(fixData);
        setHomeScore(fixData.home_score || 0);
        setAwayScore(fixData.away_score || 0);
        setStatus(fixData.status || "scheduled");

        // 2. Fetch Players for both teams
        const { data: hPlayers } = await supabase
          .from("league_players")
          .select("id, full_name, jersey_number")
          .eq("team_id", fixData.home_team.id)
          .eq("is_active", true)
          .order("jersey_number", { ascending: true });
        
        const { data: aPlayers } = await supabase
          .from("league_players")
          .select("id, full_name, jersey_number")
          .eq("team_id", fixData.away_team.id)
          .eq("is_active", true)
          .order("jersey_number", { ascending: true });

        if (hPlayers) setHomePlayers(hPlayers);
        if (aPlayers) setAwayPlayers(aPlayers);

        // 3. Fetch existing events (if editing a played match)
        if (fixData.status === 'played') {
          const { data: eventData } = await supabase
            .from("league_match_events")
            .select("*")
            .eq("fixture_id", fixtureId)
            .order("minute", { ascending: true });
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
    const supabase = createClient();

    try {
      // 1. Update Fixture Score & Status
      await supabase.from("league_fixtures").update({
        home_score: homeScore,
        away_score: awayScore,
        status: status,
        played_at: status === 'played' ? new Date().toISOString() : null
      }).eq("id", fixtureId);

      // 2. Delete old events (if editing)
      await supabase.from("league_match_events").delete().eq("fixture_id", fixtureId);

      // 3. Insert new events
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

      // NOTE: In a production app, you would call a Supabase Edge Function or DB Trigger here 
      // to recalculate `league_standings_cache` and `player_stats_cache` based on these events.
      
      alert("Match result saved successfully!");
      router.push("/admin/league/matches");
    } catch (error) {
      alert("Error saving match: " + error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !fixture) {
    return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading match details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Matches
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">
          Record Match Result
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {fixture.home_team.name} vs {fixture.away_team.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Score & Status */}
        <div className="bg-card border border-border p-6 md:p-8">
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-6 border-b border-border pb-2">Final Score & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground uppercase mb-1">{fixture.home_team.name}</p>
              <input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="w-full md:w-24 text-center bg-background border border-border p-3 text-3xl font-heading font-bold text-foreground focus:outline-none focus:border-accent" />
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase mb-2">Match Status</p>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent uppercase font-bold">
                <option value="scheduled">Scheduled</option>
                <option value="played">Played</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase mb-1">{fixture.away_team.name}</p>
              <input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="w-full md:w-24 text-center bg-background border border-border p-3 text-3xl font-heading font-bold text-foreground focus:outline-none focus:border-accent" />
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
              {events.map((ev, index) => (
                <div key={ev.id} className="grid grid-cols-12 gap-2 items-center bg-background p-3 border border-border">
                  <div className="col-span-2">
                    <input type="number" placeholder="Min" value={ev.minute} onChange={(e) => updateEvent(ev.id, "minute", e.target.value)}
                      className="w-full bg-card border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent" />
                  </div>
                  <div className="col-span-3">
                    <select value={ev.player_id} onChange={(e) => updateEvent(ev.id, "player_id", e.target.value)}
                      className="w-full bg-card border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent">
                      <option value="">Select Player</option>
                      <optgroup label={fixture.home_team.name}>
                        {homePlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}
                      </optgroup>
                      <optgroup label={fixture.away_team.name}>
                        {awayPlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <select value={ev.event_type} onChange={(e) => updateEvent(ev.id, "event_type", e.target.value)}
                      className="w-full bg-card border border-border p-2 text-sm text-foreground focus:outline-none focus:border-accent uppercase font-bold">
                      <option value="goal">⚽ Goal</option>
                      <option value="assist">👟 Assist</option>
                      <option value="yellow_card">🟨 Yellow Card</option>
                      <option value="red_card">🟥 Red Card</option>
                      <option value="substitution_in">🟩 Sub In</option>
                      <option value="substitution_out">🟥 Sub Out</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                     <select value={ev.related_player_id} onChange={(e) => updateEvent(ev.id, "related_player_id", e.target.value)}
                      className="w-full bg-card border border-border p-2 text-xs text-muted-foreground focus:outline-none focus:border-accent">
                      <option value="">Related (Assist/Sub)</option>
                      {homePlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}
                      {awayPlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.full_name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button type="button" onClick={() => removeEvent(ev.id)} className="text-red-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
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