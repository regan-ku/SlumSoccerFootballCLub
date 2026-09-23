import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ players: [], teams: [], programs: [], news: [] });
  }

  const supabase = await createClient();
  const searchPattern = `%${query}%`;

  // Run queries in parallel for maximum performance
  const [playersRes, teamsRes, programsRes, newsRes] = await Promise.all([
    supabase
      .from("internal_players")
      .select("id, first_name, last_name, position, jersey_number, photo_url")
      .ilike("first_name", searchPattern)
      .or(`last_name.ilike.${searchPattern}`)
      .eq("is_active", true)
      .limit(5),
    
    supabase
      .from("internal_teams")
      .select("id, name, team_photo_url, age_groups(code)")
      .ilike("name", searchPattern)
      .eq("is_active", true)
      .limit(5),

    supabase
      .from("programs")
      .select("id, name, category, photo_url")
      .ilike("name", searchPattern)
      .eq("is_active", true)
      .limit(5),

    supabase
      .from("updates")
      .select("id, title, type, published_at")
      .ilike("title", searchPattern)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const response = {
    players: playersRes.data || [],
    teams: teamsRes.data || [],
    programs: programsRes.data || [],
    news: newsRes.data || [],
  };

  // Cache the response for 60 seconds to reduce database load
  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}