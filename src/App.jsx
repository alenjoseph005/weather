import React, { useState, useEffect } from 'react';
import { Search, Settings, Sliders, AlertCircle, Info, Sparkles, Check, Thermometer } from 'lucide-react';
import { getWeatherData } from './services/weatherService';
import WeatherCard from './components/WeatherCard';
import DetailsGrid from './components/DetailsGrid';
import HourlyChart from './components/HourlyChart';
import ForecastList from './components/ForecastList';
import FavoritesPanel from './components/FavoritesPanel';
import SettingsModal from './components/SettingsModal';

const DEFAULT_CITY = 'Seattle';
const SEED_FAVORITES = ['Miami', 'Tokyo', 'London'];

export default function App() {
  // Config state (API configuration)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('weather_config');
    const defaultParams = {
      useLiveApi: true,
      apiProvider: 'openweathermap',
      apiKey: '62b3c52b5d0a1e93192a72afcf0598bc'
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      // Override if saved config is set to mock mode or has no API key
      if (!parsed.apiKey || parsed.apiKey === '') {
        return defaultParams;
      }
      return parsed;
    }
    return defaultParams;
  });

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weather_favorites');
    return saved ? JSON.parse(saved) : SEED_FAVORITES;
  });

  // Current city state
  const [city, setCity] = useState(DEFAULT_CITY);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Weather details state
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Unit settings: 'C' or 'F'
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('weather_unit') || 'C';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('weather_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('weather_unit', unit);
  }, [unit]);

  // Load weather when city changes or API settings change
  const loadWeather = async (targetCity, showMainLoader = false) => {
    if (showMainLoader) setIsLoading(true);
    else setIsSyncing(true);
    setError(null);

    try {
      const data = await getWeatherData(targetCity, config);
      setWeather(data);
      setCity(data.cityName); // normalize name from service
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch weather data.');
      // Auto-fallback to mock data for the TARGET city, so the dashboard updates
      const mockFallback = await getWeatherData(targetCity, { ...config, useLiveApi: false });
      setWeather(mockFallback);
      setCity(mockFallback.cityName);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadWeather(city, true);
  }, [config.useLiveApi]); // Reload when API mode is toggled

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadWeather(searchQuery.trim(), true);
      setSearchQuery('');
    }
  };

  const handleToggleFavorite = () => {
    if (!weather) return;
    const currentName = weather.cityName;
    
    if (favorites.some(f => f.toLowerCase() === currentName.toLowerCase())) {
      setFavorites(favorites.filter(f => f.toLowerCase() !== currentName.toLowerCase()));
    } else {
      setFavorites([...favorites, currentName]);
    }
  };

  const handleRemoveFavorite = (cityName) => {
    setFavorites(favorites.filter(f => f.toLowerCase() !== cityName.toLowerCase()));
  };

  // Get background gradient depending on current condition code
  const getBackgroundGradient = () => {
    if (!weather) return 'from-[#0b0f19] via-[#0f172a] to-[#1e1b4b]/20';
    
    const code = weather.current.conditionCode;
    // Sunny/Clear
    if ([1000].includes(code)) {
      return 'from-[#080d1a] via-[#0d1527] to-amber-950/15';
    }
    // Cloudy/Overcast
    if ([1003, 1006, 1009].includes(code)) {
      return 'from-[#080d1a] via-[#0e1726] to-slate-800/20';
    }
    // Rain/Thunder
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1087, 1273, 1276].includes(code)) {
      return 'from-[#080d1a] via-[#0c1322] to-blue-950/20';
    }
    // Snow
    if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(code)) {
      return 'from-[#080d1a] via-[#0c1424] to-teal-950/15';
    }
    // Fog/Mist/Breeze
    return 'from-[#080d1a] via-[#0b1220] to-purple-950/15';
  };

  const isCurrentFavorite = weather && favorites.some(
    f => f.toLowerCase() === weather.cityName.toLowerCase()
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-colors duration-1000 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start`}>
      <div className="w-full max-w-6xl space-y-6">
        
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-5">
          <div className="text-left space-y-1 self-start sm:self-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                AeroTemp
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Premium Live Climate Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Live API Mode indicator Badge */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all ${
                config.useLiveApi && config.apiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/25'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                config.useLiveApi && config.apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <span>{config.useLiveApi && config.apiKey ? 'Live API Active' : 'Simulation Mode'}</span>
            </button>

            {/* C/F Unit Toggle */}
            <div className="flex bg-slate-900 border border-white/10 rounded-full p-1 shadow-inner shrink-0">
              <button
                onClick={() => setUnit('C')}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  unit === 'C'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  unit === 'F'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                °F
              </button>
            </div>

            {/* Config Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/5 active:scale-95 transition-all group shrink-0"
              title="Open Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </header>

        {/* SEARCH AND FAVORITES COLUMN */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g. Paris, Tokyo, Reykjavik)..."
                className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Favorites Widget */}
            <div className="shrink-0 max-w-full">
              <FavoritesPanel
                favorites={favorites}
                activeCity={city}
                onSelectCity={(city) => loadWeather(city, true)}
                onRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          </div>

          {/* ERROR ALERT DISPLAY */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-between gap-3 text-rose-400 text-xs sm:text-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span className="font-medium">
                  API Fetch Error: {error}. Temporarily showing offline simulation.
                </span>
              </div>
              <button
                onClick={() => setError(null)}
                className="font-semibold underline shrink-0 hover:text-rose-300"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* MAIN WEATHER APPLICATION GRID */}
        {isLoading ? (
          <div className="h-[450px] w-full flex flex-col items-center justify-center gap-3 glass-panel rounded-3xl animate-pulse">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
            <span className="text-slate-400 font-semibold text-sm">Syncing atmosphere data...</span>
          </div>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Main card & Hourly details */}
            <div className="lg:col-span-2 space-y-6">
              
              <WeatherCard
                weather={weather}
                unit={unit}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={handleToggleFavorite}
                isSyncing={isSyncing}
                onRefresh={() => loadWeather(city, false)}
              />

              <HourlyChart
                hourly={weather?.hourly}
                unit={unit}
              />

              <DetailsGrid
                current={weather?.current}
              />

            </div>

            {/* RIGHT COLUMN: 7-day forecast */}
            <div className="lg:col-span-1">
              <ForecastList
                forecast={weather?.forecast}
                unit={unit}
              />
            </div>
          </main>
        )}

        {/* SETTINGS DIALOG */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onSave={(newConfig) => {
            setConfig(newConfig);
          }}
        />

        {/* CREDITS FOOTER */}
        <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 AeroTemp Climate Hub. Created with React & Tailwind CSS v4.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline text-indigo-400 hover:text-indigo-300"
            >
              Configure API Keys
            </button>
            <span>•</span>
            <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
              OpenWeatherMap
            </a>
            <span>•</span>
            <a href="https://www.weatherapi.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              WeatherAPI.com
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
