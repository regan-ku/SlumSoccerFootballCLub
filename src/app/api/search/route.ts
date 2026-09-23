import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ players: [], teams: [], programs: [], news: [] });
  }

  const supabase = await createClient();
  // Supabase requires % wildcards for ilike
  const searchPattern = `%${query}%`;

  try {
    // Run queries in parallel for maximum performance
    const [playersRes, ageGroupsRes, programsRes, newsRes] = await Promise.all([
      // 1. Search Players (Fixed .or() syntax)
      supabase
        .from("internal_players")
        .select("id, first_name, last_name, position, jersey_number, photo_url")
        .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`)
        .eq("is_active", true)
        .limit(5),
      
      // 2. Search Age Groups (Since Internal Teams are now Dynamic Squads)
      supabase
        .from("age_groups")
        .select("id, code, name")
        .or(`code.ilike.${searchPattern},name.ilike.${searchPattern}`)
        .eq("is_active", true)
        .limit(5),

      // 3. Search Programs
      supabase
        .from("programs")
        .select("id, name, category, photo_url")
        .ilike("name", searchPattern)
        .eq("is_active", true)
        .limit(5),

      // 4. Search News/Updates
      supabase
        .from("updates")
        .select("id, title, type, published_at")
        .ilike("title", searchPattern)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5),
    ]);

    // Map Age Groups to "Teams" format so the frontend SearchModal doesn't break
    const formattedTeams = (ageGroupsRes.data || []).flatMap((ag: any) => [
      { 
        id: `${ag.id}_male`, 
        name: `${ag.code} Boys`, 
        team_photo_url: null, // Squads use icons, not photos
        age_groups: { code: ag.code } 
      },
      { 
        id: `${ag.id}_female`, 
        name: `${ag.code} Girls`, 
        team_photo_url: null, 
        age_groups: { code: ag.code } 
      }
    ]);

    const response = {
      players: playersRes.data || [],
      teams: formattedTeams,
      programs: programsRes.data || [],
      news: newsRes.data || [],
    };

    // Cache the response for 60 seconds to reduce database load
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}