import React, { useState } from 'react';
import { X, Key, Info, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, config, onSave }) {
  const [useLiveApi, setUseLiveApi] = useState(config.useLiveApi);
  const [apiProvider, setApiProvider] = useState(config.apiProvider || 'weatherapi');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      useLiveApi,
      apiProvider,
      apiKey: apiKey.trim()
    });
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden glass-panel rounded-2xl shadow-2xl border border-white/10 flex flex-col text-left">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-lg">
            <Key className="w-5 h-5 text-indigo-400" />
            <span>Weather API Config</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Active Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-semibold text-slate-100">Live Weather Reports</div>
              <div className="text-xs text-slate-400">Toggle live API calls or fallback to demo data</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useLiveApi}
                onChange={(e) => setUseLiveApi(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          {useLiveApi && (
            <div className="space-y-4 animate-fade-in">
              {/* API Provider Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  API Provider
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="weatherapi">WeatherAPI.com (Recommended - Instant Key)</option>
                  <option value="openweathermap">OpenWeatherMap.org (5-day Forecast)</option>
                </select>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required={useLiveApi}
                    placeholder={`Enter your ${apiProvider === 'weatherapi' ? 'WeatherAPI' : 'OpenWeatherMap'} key`}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* API Information Panel */}
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <div className="space-y-1">
                  <p>Don't have a key? Register for free:</p>
                  {apiProvider === 'weatherapi' ? (
                    <a
                      href="https://www.weatherapi.com/signup.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline text-indigo-400 hover:text-indigo-300"
                    >
                      Get WeatherAPI Key (Instant Activation)
                    </a>
                  ) : (
                    <a
                      href="https://home.openweathermap.org/users/sign_up"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline text-indigo-400 hover:text-indigo-300"
                    >
                      Get OpenWeatherMap Key (Takes 1-2 hours)
                    </a>
                  )}
                  <p className="text-[10px] text-slate-400 pt-1">
                    Note: If your key is invalid or requests fail, the dashboard will fall back to simulation mode.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-white/10 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
            >
              {showSavedToast ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                  <span>Config Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
