import React from 'react';
import { CalendarDays, CloudRain } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

export default function ForecastList({ forecast, unit }) {
  if (!forecast || forecast.length === 0) return null;

  // Calculate weekly minimum and maximum temperatures for the range bar
  const minKey = unit === 'C' ? 'minTempC' : 'minTempF';
  const maxKey = unit === 'C' ? 'maxTempC' : 'maxTempF';

  const weeklyMin = Math.min(...forecast.map((d) => d[minKey]));
  const weeklyMax = Math.max(...forecast.map((d) => d[maxKey]));
  const weeklyRange = weeklyMax - weeklyMin || 1;

  return (
    <div className="glass-panel rounded-3xl p-6 text-left shadow-xl border border-white/10 animate-fade-in flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-100">7-Day Forecast</h3>
        </div>

        <div className="space-y-4">
          {forecast.map((day, idx) => {
            const minTemp = day[minKey];
            const maxTemp = day[maxKey];
            
            // Calculate percentage positions for the spread bar
            const barLeft = ((minTemp - weeklyMin) / weeklyRange) * 100;
            const barWidth = ((maxTemp - minTemp) / weeklyRange) * 100;

            return (
              <div
                key={day.date}
                className="grid grid-cols-12 items-center gap-2 py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] px-2 -mx-2 rounded-xl transition-colors"
              >
                {/* 1. Day Name */}
                <div className="col-span-3 sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-100">
                    {day.dayName}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {day.date.substring(5).replace('-', '/')}
                  </p>
                </div>

                {/* 2. Precip Prob */}
                <div className="col-span-2 flex items-center justify-center">
                  {day.precipProb > 0 ? (
                    <span className="flex items-center text-[10px] font-semibold text-sky-400" title="Precipitation probability">
                      <CloudRain className="w-3 h-3 mr-0.5 shrink-0" />
                      {day.precipProb}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">0%</span>
                  )}
                </div>

                {/* 3. Weather Icon & Condition */}
                <div className="col-span-2 flex items-center justify-center">
                  <WeatherIcon code={day.conditionCode} className="w-6 h-6" />
                </div>

                <div className="hidden sm:col-span-2 sm:flex items-center">
                  <span className="text-xs text-slate-300 truncate" title={day.conditionText}>
                    {day.conditionText}
                  </span>
                </div>

                {/* 4. Temp Spread Bar */}
                <div className="col-span-5 sm:col-span-4 flex items-center justify-end gap-3 font-medium">
                  {/* Min Temp Label */}
                  <span className="text-xs text-slate-400 w-6 text-right">
                    {minTemp}°
                  </span>

                  {/* Range Bar Graph */}
                  <div className="relative flex-1 h-2 bg-slate-950/40 rounded-full overflow-hidden min-w-[50px] max-w-[120px]">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-rose-400"
                      style={{
                        left: `${barLeft}%`,
                        width: `${Math.max(12, barWidth)}%`, // Ensure a minimum width so it is always visible
                      }}
                    />
                  </div>

                  {/* Max Temp Label */}
                  <span className="text-xs text-slate-100 w-6 text-left">
                    {maxTemp}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 text-center">
        Hover icons to view details. Calculations scaled relative to local seasonal extremes.
      </div>
    </div>
  );
}
