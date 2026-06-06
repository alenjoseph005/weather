import React from 'react';
import { MapPin, Calendar, Star, RefreshCw } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

export default function WeatherCard({ weather, unit, isFavorite, onToggleFavorite, isSyncing, onRefresh }) {
  if (!weather) return null;

  const { cityName, country, current } = weather;
  const temp = unit === 'C' ? current.tempC : current.tempF;
  const feelsLike = unit === 'C' ? current.feelsLikeC : current.feelsLikeF;

  // Determine general weather type for background animation
  const code = current.conditionCode;
  let weatherType = 'clear';
  if ([1000].includes(code)) weatherType = 'clear';
  else if ([1003, 1006, 1009].includes(code)) weatherType = 'cloudy';
  else if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1087, 1273, 1276].includes(code)) weatherType = 'rainy';
  else if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(code)) weatherType = 'snowy';
  else weatherType = 'misty';

  // Format today's date
  const formatDate = () => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[340px] shadow-xl border border-white/10 animate-fade-in group">
      
      {/* Micro-animations CSS Injector */}
      <style>{`
        @keyframes drift {
          0% { transform: translateX(-10%); }
          50% { transform: translateX(10%); }
          100% { transform: translateX(-10%); }
        }
        @keyframes rainfall {
          0% { transform: translateY(-20px) rotate(15deg); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(280px) rotate(15deg); opacity: 0; }
        }
        @keyframes snowfall {
          0% { transform: translateY(-20px) translateX(0); opacity: 0; }
          50% { opacity: 0.8; transform: translateY(140px) translateX(15px); }
          100% { transform: translateY(280px) translateX(-15px); opacity: 0; }
        }
        @keyframes sunshine {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        .anim-drift { animation: drift 15s ease-in-out infinite; }
        .anim-rain { animation: rainfall 1.2s linear infinite; }
        .anim-snow { animation: snowfall 3s ease-in-out infinite; }
        .anim-sun { animation: sunshine 8s ease-in-out infinite; }
      `}</style>

      {/* Atmospheric Background Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {weatherType === 'clear' && (
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl anim-sun" />
        )}
        
        {weatherType === 'cloudy' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-16 bg-slate-300 rounded-full blur-xl anim-drift" />
            <div className="absolute top-24 right-10 w-40 h-20 bg-slate-400 rounded-full blur-xl anim-drift" style={{ animationDelay: '-4s' }} />
          </div>
        )}
        
        {weatherType === 'rainy' && (
          <div className="absolute inset-0 opacity-30">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-blue-300 w-[1.5px] h-[25px] rounded-full anim-rain"
                style={{
                  left: `${8 + i * 8}%`,
                  top: `-${20 + (i % 3) * 15}px`,
                  animationDelay: `${i * 0.13}s`,
                  animationDuration: `${0.8 + (i % 4) * 0.15}s`
                }}
              />
            ))}
          </div>
        )}

        {weatherType === 'snowy' && (
          <div className="absolute inset-0 opacity-40">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white w-[4px] h-[4px] rounded-full anim-snow"
                style={{
                  left: `${5 + i * 10}%`,
                  top: `-${10 + (i % 3) * 10}px`,
                  animationDelay: `${i * 0.27}s`,
                  animationDuration: `${2.2 + (i % 3) * 0.4}s`
                }}
              />
            ))}
          </div>
        )}

        {weatherType === 'misty' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/10 to-transparent blur-md opacity-30 anim-drift" />
        )}
      </div>

      {/* Header Info */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-lg sm:text-xl">
            <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[280px]">
              {cityName}, {country}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{formatDate()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 active:scale-95 transition-all"
            title="Refresh weather data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          
          <button
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-xl border border-white/10 active:scale-95 transition-all ${
              isFavorite 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'text-slate-400 hover:text-amber-400 hover:bg-white/5'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Star className="w-4 h-4 fill-current" style={{ fillOpacity: isFavorite ? 1 : 0 }} />
          </button>
        </div>
      </div>

      {/* Current Stats Area */}
      <div className="relative z-10 flex items-center justify-between mt-8 mb-6">
        <div>
          <div className="flex items-baseline">
            <span className="text-7xl sm:text-8xl font-bold tracking-tighter text-slate-100">
              {temp}
            </span>
            <span className="text-3xl sm:text-4xl font-medium text-indigo-300 ml-1">
              °{unit}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Feels like <span className="font-semibold text-slate-200">{feelsLike}°{unit}</span>
          </p>
        </div>

        {/* Large Condition Icon */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300">
          <WeatherIcon code={code} className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
      </div>

      {/* Condition Text */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-slate-100 font-semibold text-base sm:text-lg">
          {current.conditionText}
        </span>
        <div className="flex gap-2">
          {/* Tag badges */}
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-indigo-300">
            UV: {current.uvIndex}
          </span>
          <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full border ${
            current.aqi <= 2 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            AQI: {current.aqiText}
          </span>
        </div>
      </div>

    </div>
  );
}
