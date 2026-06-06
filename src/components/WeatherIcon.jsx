import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  Snowflake,
  CloudHail,
  Wind
} from 'lucide-react';

export default function WeatherIcon({ code, isDay = true, className = 'w-6 h-6' }) {
  // WeatherAPI condition code mapping
  switch (code) {
    case 1000: // Sunny / Clear
      return isDay ? (
        <Sun className={`${className} text-amber-400 animate-spin-slow`} style={{ animationDuration: '20s' }} />
      ) : (
        <Moon className={`${className} text-indigo-300`} />
      );

    case 1003: // Partly cloudy
      return isDay ? (
        <CloudSun className={`${className} text-amber-300`} />
      ) : (
        <CloudMoon className={`${className} text-indigo-200`} />
      );

    case 1006: // Cloudy
    case 1009: // Overcast
      return <Cloud className={`${className} text-slate-400`} />;

    case 1030: // Mist
    case 1135: // Fog
    case 1147: // Freezing fog
      return <Wind className={`${className} text-slate-300 opacity-80`} />;

    case 1063: // Patchy rain nearby
    case 1150: // Patchy light drizzle
    case 1153: // Light drizzle
    case 1180: // Patchy light rain
    case 1183: // Light rain
    case 1240: // Light rain shower
      return <CloudDrizzle className={`${className} text-sky-400`} />;

    case 1069: // Patchy sleet nearby
    case 1204: // Light sleet
    case 1207: // Moderate/heavy sleet
    case 1249: // Light sleet showers
      return <CloudHail className={`${className} text-teal-300`} />;

    case 1186: // Moderate rain at times
    case 1189: // Moderate rain
    case 1192: // Heavy rain at times
    case 1195: // Heavy rain
    case 1243: // Moderate/heavy rain shower
    case 1246: // Torrential rain shower
      return <CloudRain className={`${className} text-blue-500`} />;

    case 1087: // Thundery outbreaks nearby
    case 1273: // Patchy light rain with thunder
    case 1276: // Moderate or heavy rain with thunder
      return <CloudLightning className={`${className} text-yellow-400 animate-pulse`} />;

    case 1066: // Patchy snow nearby
    case 1114: // Blowing snow
    case 1210: // Patchy light snow
    case 1213: // Light snow
    case 1216: // Patchy moderate snow
    case 1219: // Moderate snow
    case 1255: // Light snow showers
      return <Snowflake className={`${className} text-sky-100 animate-pulse`} />;

    case 1117: // Blizzard
    case 1222: // Patchy heavy snow
    case 1225: // Heavy snow
    case 1258: // Moderate or heavy snow showers
      return <CloudSnow className={`${className} text-slate-100`} />;

    case 1279: // Patchy light snow with thunder
    case 1282: // Moderate or heavy snow with thunder
      return <CloudLightning className={`${className} text-violet-300`} />;

    default:
      return isDay ? (
        <Sun className={`${className} text-amber-400`} />
      ) : (
        <Moon className={`${className} text-indigo-300`} />
      );
  }
}
