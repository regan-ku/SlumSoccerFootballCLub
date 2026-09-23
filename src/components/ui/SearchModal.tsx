"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/UseDebounce"; // <-- FIXED: lowercase 'u'
import { Search, X, Loader2, Users, Shield, Target, Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  // Added optional chaining (?.) for maximum safety
  const hasResults = results && (
    (results.players?.length > 0) || 
    (results.teams?.length > 0) || 
    (results.programs?.length > 0) || 
    (results.news?.length > 0)
  );
  const isSearching = debouncedQuery.length >= 2 && isLoading;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search players, teams, programs, or news..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && <Loader2 className="w-5 h-5 text-accent animate-spin" />}
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-sm transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length < 2 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Type at least 2 characters to search...</p>
            </div>
          )}

          {isSearching && (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-10 h-10 bg-muted rounded-sm animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && !hasResults && query.length >= 2 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}

          {!isSearching && hasResults && (
            <div className="space-y-6 py-2">
              {results?.players?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Players
                  </h3>
                  {results.players.map((player: any) => (
                    <Link key={player.id} href={`/players/${player.id}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-muted rounded-sm transition-colors group">
                      <div className="w-10 h-10 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                        {player.photo_url ? (
                          <Image src={player.photo_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {player.first_name[0]}{player.last_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-accent transition-colors">{player.first_name} {player.last_name}</p>
                        <p className="text-xs text-muted-foreground">{player.position || "Player"} #{player.jersey_number || "00"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results?.teams?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Teams
                  </h3>
                  {results.teams.map((team: any) => (
                    <Link key={team.id} href={`/teams/${team.id}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-muted rounded-sm transition-colors group">
                      <div className="w-10 h-10 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                        {team.team_photo_url ? (
                          <Image src={team.team_photo_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-full h-full p-2 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-accent transition-colors">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.age_groups?.code || "Team"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results?.programs?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Programs
                  </h3>
                  {results.programs.map((prog: any) => (
                    <Link key={prog.id} href={`/programs/${prog.id}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-muted rounded-sm transition-colors group">
                      <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-accent transition-colors">{prog.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{prog.category?.replace("_", " ")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results?.news?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2 flex items-center gap-2">
                    <Newspaper className="w-3 h-3" /> News & Updates
                  </h3>
                  {results.news.map((item: any) => (
                    <Link key={item.id} href={`/news/${item.id}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-muted rounded-sm transition-colors group">
                      <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center flex-shrink-0">
                        <Newspaper className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-accent transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.published_at).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-muted/30 border-t border-border text-[10px] text-muted-foreground flex justify-between items-center">
          <span>Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-sans">ESC</kbd> to close</span>
          <span>Full-site search powered by Slum Stars FC</span>
        </div>
      </div>
    </div>
  );
}