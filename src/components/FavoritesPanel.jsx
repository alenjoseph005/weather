import React from 'react';
import { Star, StarOff, Sparkles } from 'lucide-react';

export default function FavoritesPanel({ favorites, activeCity, onSelectCity, onRemoveFavorite }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>No favorite locations yet. Search for a city and star it to save it here!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
        <span>Saved:</span>
      </span>
      
      <div className="flex gap-2">
        {favorites.map((city) => {
          const isActive = city.toLowerCase() === activeCity.toLowerCase();
          return (
            <div
              key={city}
              className={`flex items-center shrink-0 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                  : 'glass-panel text-slate-300 hover:text-slate-100 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => onSelectCity(city)}
                className="pl-3.5 pr-2 py-1.5 font-semibold capitalize tracking-wide active:scale-95 transition-transform"
              >
                {city}
              </button>
              
              <button
                onClick={() => onRemoveFavorite(city)}
                className="pr-2.5 pl-1 py-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title={`Remove ${city} from favorites`}
              >
                <StarOff className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
