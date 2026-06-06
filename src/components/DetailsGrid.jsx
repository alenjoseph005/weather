import React from 'react';
import { Wind, Droplets, Eye, Sunrise, Sunset, Gauge } from 'lucide-react';

export default function DetailsGrid({ current }) {
  if (!current) return null;

  const cards = [
    {
      id: 'wind',
      title: 'Wind Speed',
      value: `${current.windKph} km/h`,
      subtitle: `Direction: ${current.windDir}`,
      icon: Wind,
      iconColor: 'text-sky-400',
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: `${current.humidity}%`,
      subtitle: current.humidity > 60 ? 'High moisture' : current.humidity < 30 ? 'Dry air' : 'Optimal humidity',
      icon: Droplets,
      iconColor: 'text-blue-400',
    },
    {
      id: 'visibility',
      title: 'Visibility',
      value: `${current.visibilityKm} km`,
      subtitle: current.visibilityKm >= 10 ? 'Perfect clarity' : 'Light mist',
      icon: Eye,
      iconColor: 'text-purple-400',
    },
    {
      id: 'pressure',
      title: 'Air Pressure',
      value: `${current.pressureMb} hPa`,
      subtitle: current.pressureMb > 1013 ? 'High pressure system' : 'Low pressure system',
      icon: Gauge,
      iconColor: 'text-emerald-400',
    },
    {
      id: 'sunrise',
      title: 'Sunrise',
      value: current.sunrise,
      subtitle: 'First light',
      icon: Sunrise,
      iconColor: 'text-amber-400 animate-pulse',
    },
    {
      id: 'sunset',
      title: 'Sunset',
      value: current.sunset,
      subtitle: 'Dusk falls',
      icon: Sunset,
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between text-left"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 bg-white/5 rounded-lg border border-white/10 ${card.iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {card.value}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
                {card.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
