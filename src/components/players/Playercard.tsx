"use client";

import Link from "next/link";
import { Star } from "lucide-react";

// Strict TypeScript interface to prevent "implicit any" and missing prop errors
export interface PlayerCardProps {
  player: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url?: string | null;
    position?: string | null;
    jersey_number?: number | string | null;
    is_captain?: boolean;
    is_vice_captain?: boolean;
    age_groups?: { code: string; name: string } | null; // Added for squad info
  };
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link 
      href={`/players/${player.id}`} 
      className="group bg-card border border-border hover:border-accent transition-all duration-300 overflow-hidden block"
    >
      {/* Player Photo Area */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {player.photo_url ? (
          <img 
            src={player.photo_url} 
            alt={`${player.first_name} ${player.last_name}`} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="font-heading text-5xl font-bold">
              {player.first_name[0]}{player.last_name[0]}
            </span>
          </div>
        )}
        
        {/* Captain Badge */}
        {(player.is_captain || player.is_vice_captain) && (
          <div 
            className="absolute top-3 right-3 bg-accent text-accent-foreground p-1.5 rounded-full shadow-lg" 
            title={player.is_captain ? "Team Captain" : "Vice Captain"}
          >
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-heading text-2xl font-bold text-accent">
            #{player.jersey_number || "00"}
          </span>
          <span className="text-xs font-bold uppercase text-muted-foreground">
            {player.position || "Player"}
          </span>
        </div>
        <h3 className="font-heading text-lg font-bold uppercase leading-tight mb-1 text-foreground group-hover:text-accent transition-colors">
          {player.first_name} {player.last_name}
        </h3>
        
        {/* Squad Info */}
        {player.age_groups && (
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
            {player.age_groups.code} Squad
          </p>
        )}

        {(player.is_captain || player.is_vice_captain) && (
          <p className="text-xs font-bold text-accent uppercase tracking-wider mt-1">
            {player.is_captain ? "Team Captain" : "Vice Captain"}
          </p>
        )}
      </div>
    </Link>
  );
}