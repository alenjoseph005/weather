import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, CloudRain } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

export default function HourlyChart({ hourly, unit }) {
  const scrollRef = useRef(null);

  if (!hourly || hourly.length === 0) return null;

  // Filter or take a subset of hours (every hour for 24h, scrollable)
  const data = hourly;

  // Find min/max temperature to scale the SVG chart
  const temps = data.map(h => h.tempC);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = maxTemp - minTemp || 1;

  // Chart Dimensions (static viewport, we can plot 24 points or 12 points to make it legible)
  // Let's plot 12 points (every 2nd hour) for the SVG to keep it clean and uncrowded,
  // but keep the scrollable list showing all 24 hours!
  const chartData = data.filter((_, idx) => idx % 2 === 0);
  
  const width = 800;
  const height = 120;
  const padding = 20;

  // Map temperature to Y coordinate (inverted for SVG coordinates)
  const getX = (index) => padding + (index * (width - padding * 2)) / (chartData.length - 1);
  const getY = (temp) => {
    const scale = (temp - minTemp) / tempRange;
    return height - padding - scale * (height - padding * 2);
  };

  // Generate SVG Path (Cubic Bezier curve)
  let pathD = '';
  if (chartData.length > 0) {
    const points = chartData.map((h, i) => ({ x: getX(i), y: getY(h.tempC) }));
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Generate Area Path (for gradient fill below the line)
  const areaD = pathD 
    ? `${pathD} L ${getX(chartData.length - 1)} ${height - 10} L ${getX(0)} ${height - 10} Z` 
    : '';

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 text-left shadow-xl border border-white/10 animate-fade-in flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">Hourly Forecast</h3>
          <p className="text-xs text-slate-400">Temperature trends and conditions over the next 24 hours</p>
        </div>
        
        {/* Navigation Buttons for scroll */}
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Custom SVG Line Chart (Rendered only on larger screens / container) */}
      <div className="w-full overflow-x-auto mb-6 bg-slate-950/20 rounded-2xl border border-white/5 p-4 scrollbar-thin">
        <div className="min-w-[800px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[120px] overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(129, 140, 248)" />
                <stop offset="50%" stopColor="rgb(168, 85, 247)" />
                <stop offset="100%" stopColor="rgb(244, 63, 94)" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={padding} y1={getY(minTemp)} x2={width - padding} y2={getY(minTemp)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1={padding} y1={getY(maxTemp)} x2={width - padding} y2={getY(maxTemp)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

            {/* Area under curve */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Bezier Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}

            {/* Data Points */}
            {chartData.map((h, i) => {
              const x = getX(i);
              const y = getY(h.tempC);
              const displayTemp = unit === 'C' ? h.tempC : h.tempF;
              return (
                <g key={i} className="group/node">
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-indigo-400 stroke-slate-950 stroke-2 cursor-pointer hover:r-6 transition-all"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-indigo-200"
                  >
                    {displayTemp}°
                  </text>
                  <text
                    x={x}
                    y={height - 2}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-500 font-medium"
                  >
                    {h.time}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. Scrollable Capsule List */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-thin select-none snap-x"
      >
        {data.map((item, idx) => {
          const displayTemp = unit === 'C' ? item.tempC : item.tempF;
          return (
            <div
              key={idx}
              className="flex-shrink-0 w-[78px] snap-start glass-panel glass-panel-hover rounded-2xl p-3 flex flex-col items-center justify-between text-center border border-white/5"
            >
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                {item.time}
              </span>
              
              <div className="my-2.5">
                <WeatherIcon code={item.conditionCode} className="w-7 h-7" />
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold text-slate-100">
                  {displayTemp}°
                </span>
                {item.precipProb > 0 ? (
                  <span className="flex items-center text-[9px] font-semibold text-sky-400">
                    <CloudRain className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                    {item.precipProb}%
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-medium">
                    Dry
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
