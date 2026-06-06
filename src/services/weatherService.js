// Weather service for fetching live reports or generating high-fidelity mock data

// Simple deterministic hash function to seed mock data based on city name
function getCitySeed(cityName) {
  let hash = 0;
  const str = cityName.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Weather Archetypes based on seed
const ARCHETYPES = {
  RAINY: 'Rainy',
  SUNNY: 'Sunny',
  CLOUDY: 'Cloudy',
  SNOWY: 'Snowy',
  WINDY: 'Windy'
};

function getCityArchetype(seed) {
  const mod = seed % 5;
  if (mod === 0) return ARCHETYPES.RAINY;
  if (mod === 1) return ARCHETYPES.SUNNY;
  if (mod === 2) return ARCHETYPES.CLOUDY;
  if (mod === 3) return ARCHETYPES.SNOWY;
  return ARCHETYPES.WINDY;
}

// Helper to convert Celsius to Fahrenheit
function cToF(c) {
  return Math.round((c * 9) / 5 + 32);
}

// Map archetype to Weather Condition Code
// Using standard WeatherAPI condition codes (e.g. 1000 for sunny, 1003 for partly cloudy, 1063 for patchy rain, etc.)
function getConditionDetails(archetype, dayOffset = 0, seed = 0) {
  // Let some variability happen day-to-day
  const variation = (seed + dayOffset) % 4;
  
  switch (archetype) {
    case ARCHETYPES.SUNNY:
      if (variation === 0) return { code: 1000, text: 'Sunny' };
      if (variation === 1) return { code: 1003, text: 'Partly Cloudy' };
      return { code: 1000, text: 'Clear' };
      
    case ARCHETYPES.RAINY:
      if (variation === 0) return { code: 1189, text: 'Moderate Rain' };
      if (variation === 1) return { code: 1183, text: 'Light Rain' };
      if (variation === 2) return { code: 1240, text: 'Patchy Rain Showers' };
      return { code: 1276, text: 'Moderate or Heavy Rain with Thunder' };
      
    case ARCHETYPES.CLOUDY:
      if (variation === 0) return { code: 1006, text: 'Cloudy' };
      if (variation === 1) return { code: 1009, text: 'Overcast' };
      return { code: 1003, text: 'Partly Cloudy' };
      
    case ARCHETYPES.SNOWY:
      if (variation === 0) return { code: 1219, text: 'Moderate Snow' };
      if (variation === 1) return { code: 1213, text: 'Light Snow' };
      return { code: 1225, text: 'Heavy Snow' };
      
    case ARCHETYPES.WINDY:
    default:
      if (variation === 0) return { code: 1030, text: 'Mist' };
      if (variation === 1) return { code: 1009, text: 'Overcast' };
      return { code: 1003, text: 'Partly Cloudy & Breezy' };
  }
}

// Generate high-fidelity mock data deterministically
export function generateMockWeatherData(cityName) {
  const seed = getCitySeed(cityName);
  const archetype = getCityArchetype(seed);
  
  // Base values for weather based on archetype
  let baseTemp = 20; // Celsius
  let baseHumidity = 50; // %
  let baseWind = 15; // kph
  let baseVisibility = 10; // km
  let basePressure = 1013; // mb
  let baseUv = 5;
  let baseAqi = 2; // Moderate
  
  switch (archetype) {
    case ARCHETYPES.SUNNY:
      baseTemp = 28;
      baseHumidity = 35;
      baseWind = 10;
      baseVisibility = 12;
      basePressure = 1018;
      baseUv = 9;
      baseAqi = 1; // Good
      break;
    case ARCHETYPES.RAINY:
      baseTemp = 15;
      baseHumidity = 90;
      baseWind = 22;
      baseVisibility = 6;
      basePressure = 1006;
      baseUv = 2;
      baseAqi = 1; // Good (rain washes pollutants)
      break;
    case ARCHETYPES.CLOUDY:
      baseTemp = 18;
      baseHumidity = 70;
      baseWind = 12;
      baseVisibility = 9;
      basePressure = 1012;
      baseUv = 4;
      baseAqi = 3; // Moderate / Unhealthy
      break;
    case ARCHETYPES.SNOWY:
      baseTemp = -2;
      baseHumidity = 80;
      baseWind = 18;
      baseVisibility = 5;
      basePressure = 1009;
      baseUv = 1;
      baseAqi = 2; // Moderate
      break;
    case ARCHETYPES.WINDY:
      baseTemp = 13;
      baseHumidity = 60;
      baseWind = 32;
      baseVisibility = 8;
      basePressure = 1010;
      baseUv = 4;
      baseAqi = 2;
      break;
  }
  
  // Add variance based on city seed
  const tempOffset = (seed % 10) - 5; // -5 to +4
  const finalTemp = Math.round(baseTemp + tempOffset);
  const feelsLike = Math.round(finalTemp + (archetype === ARCHETYPES.SUNNY ? 2 : -2));
  const humidity = Math.max(10, Math.min(100, Math.round(baseHumidity + (seed % 15) - 7)));
  const windKph = Math.max(2, Math.round(baseWind + (seed % 20) - 10));
  const pressure = Math.round(basePressure + (seed % 16) - 8);
  const visibility = Math.max(1, Math.round(baseVisibility + (seed % 6) - 3));
  const uvIndex = Math.max(0, Math.round(baseUv + (seed % 3) - 1));
  const aqi = Math.max(1, Math.min(6, Math.round(baseAqi + (seed % 3) - 1)));
  
  const aqiTexts = {
    1: 'Good',
    2: 'Moderate',
    3: 'Unhealthy for Sensitive Groups',
    4: 'Unhealthy',
    5: 'Very Unhealthy',
    6: 'Hazardous'
  };
  
  const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const windDir = windDirections[seed % windDirections.length];
  
  // Dynamic current date
  const now = new Date();
  const currentDetails = getConditionDetails(archetype, 0, seed);
  
  // Format city name nicely
  const capitalizedCity = cityName.trim().replace(/\b\w/g, c => c.toUpperCase());
  
  // 1. Current Weather
  const current = {
    tempC: finalTemp,
    tempF: cToF(finalTemp),
    conditionText: currentDetails.text,
    conditionCode: currentDetails.code,
    humidity,
    windKph,
    windDir,
    feelsLikeC: feelsLike,
    feelsLikeF: cToF(feelsLike),
    uvIndex,
    pressureMb: pressure,
    visibilityKm: visibility,
    sunrise: '06:12 AM',
    sunset: '08:24 PM',
    aqi,
    aqiText: aqiTexts[aqi]
  };
  
  // 2. 24-Hour Forecast
  const hourly = [];
  for (let h = 0; h < 24; h++) {
    // Generate diurnal temperature wave peaking around 3-4 PM (15:00) and coolest at 5 AM (05:00)
    const angle = ((h - 5) / 24) * 2 * Math.PI;
    const tempWave = Math.sin(angle - Math.PI / 2); // Ranges -1 to +1
    const hourlyTemp = Math.round(finalTemp + tempWave * 5 + ((seed + h) % 3 - 1));
    
    // Hour formatted string
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const timeString = `${hour12}:00 ${suffix}`;
    
    // Vary conditions slightly throughout the day
    const hourArchetype = (h > 10 && h < 17 && archetype === ARCHETYPES.SUNNY) ? ARCHETYPES.SUNNY : archetype;
    const hourDetails = getConditionDetails(hourArchetype, Math.floor(h / 6), seed + h);
    
    // Estimate rain/precip probability
    let precipProb = 0;
    if (archetype === ARCHETYPES.RAINY) precipProb = Math.max(30, Math.min(100, 70 + ((seed + h) % 40) - 20));
    else if (archetype === ARCHETYPES.SNOWY) precipProb = Math.max(20, Math.min(100, 60 + ((seed + h) % 40) - 20));
    else if (archetype === ARCHETYPES.CLOUDY) precipProb = Math.max(0, 15 + ((seed + h) % 20) - 10);
    else if (archetype === ARCHETYPES.WINDY) precipProb = Math.max(0, 10 + ((seed + h) % 15));
    
    hourly.push({
      time: timeString,
      tempC: hourlyTemp,
      tempF: cToF(hourlyTemp),
      conditionText: hourDetails.text,
      conditionCode: hourDetails.code,
      precipProb
    });
  }
  
  // 3. 7-Day Forecast
  const forecast = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let d = 0; d < 7; d++) {
    const forecastDate = new Date();
    forecastDate.setDate(now.getDate() + d);
    const dayName = d === 0 ? 'Today' : days[forecastDate.getDay()];
    
    // Generate slight weather progression (days can be warmer/cooler)
    const dayTempOffset = Math.round(Math.sin(((seed + d) / 7) * 2 * Math.PI) * 4 + ((seed * d) % 5 - 2));
    const maxTempC = finalTemp + dayTempOffset + 3;
    const minTempC = finalTemp + dayTempOffset - 4;
    
    const dayArchetype = (seed + d) % 6 === 0 ? ARCHETYPES.CLOUDY : archetype;
    const dayDetails = getConditionDetails(dayArchetype, d, seed);
    
    let precipProb = 0;
    if (dayArchetype === ARCHETYPES.RAINY) precipProb = 80;
    else if (dayArchetype === ARCHETYPES.SNOWY) precipProb = 70;
    else if (dayArchetype === ARCHETYPES.CLOUDY) precipProb = 25;
    else if (dayArchetype === ARCHETYPES.SUNNY) precipProb = 5;
    else precipProb = 15;
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      dayName,
      maxTempC,
      minTempC,
      maxTempF: cToF(maxTempC),
      minTempF: cToF(minTempC),
      conditionText: dayDetails.text,
      conditionCode: dayDetails.code,
      precipProb
    });
  }
  
  // Map country name deterministically
  const countries = ['US', 'UK', 'FR', 'JP', 'DE', 'AU', 'CA', 'IN', 'BR', 'ZA'];
  const country = countries[seed % countries.length];
  
  return {
    cityName: capitalizedCity,
    country,
    current,
    hourly,
    forecast
  };
}

// Fetch from OpenWeatherMap
async function fetchOpenWeatherMap(cityName, apiKey) {
  // 1. Fetch current weather
  const currentRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`
  );
  if (!currentRes.ok) {
    throw new Error(`OpenWeatherMap Error: ${currentRes.statusText} (${currentRes.status})`);
  }
  const currentData = await currentRes.json();
  
  // 2. Fetch forecast
  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`
  );
  if (!forecastRes.ok) {
    throw new Error(`OpenWeatherMap Forecast Error: ${forecastRes.statusText}`);
  }
  const forecastData = await forecastRes.json();
  
  // Map OpenWeatherMap Condition Code to WeatherAPI codes
  // We do a simple translation map for consistency in icons
  const mapOwmToCode = (owmId, iconCode) => {
    if (owmId === 800) return 1000; // Sunny / Clear
    if (owmId >= 801 && owmId <= 802) return 1003; // Partly cloudy
    if (owmId === 803) return 1006; // Cloudy
    if (owmId === 804) return 1009; // Overcast
    if (owmId >= 500 && owmId <= 504) return 1189; // Moderate rain
    if (owmId >= 520 && owmId <= 531) return 1240; // Rain showers
    if (owmId >= 300 && owmId <= 321) return 1153; // Light drizzle
    if (owmId >= 200 && owmId <= 232) return 1276; // Rain with thunder
    if (owmId >= 600 && owmId <= 622) return 1219; // Snow
    if (owmId >= 701 && owmId <= 781) return 1030; // Mist / Fog / Haze
    return 1003;
  };

  const tempC = Math.round(currentData.main.temp);
  const feelsLikeC = Math.round(currentData.main.feels_like);
  const condId = currentData.weather[0]?.id || 800;
  const condText = currentData.weather[0]?.description || 'Clear';
  const condCode = mapOwmToCode(condId);
  
  const currentInfo = {
    tempC,
    tempF: cToF(tempC),
    conditionText: condText.charAt(0).toUpperCase() + condText.slice(1),
    conditionCode: condCode,
    humidity: currentData.main.humidity,
    windKph: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
    windDir: getWindDirection(currentData.wind.deg || 0),
    feelsLikeC,
    feelsLikeF: cToF(feelsLikeC),
    uvIndex: 5, // Not available in basic API
    pressureMb: currentData.main.pressure,
    visibilityKm: Math.round((currentData.visibility || 10000) / 1000),
    sunrise: formatTime(currentData.sys.sunrise, currentData.timezone),
    sunset: formatTime(currentData.sys.sunset, currentData.timezone),
    aqi: 2, // Basic API doesn't include AQI
    aqiText: 'Moderate'
  };
  
  // OpenWeatherMap forecast has 3-hourly entries
  // Group by day for the 5-day forecast
  const dailyGroups = {};
  const hourly = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  forecastData.list.forEach((item, index) => {
    const dateObj = new Date(item.dt * 1000);
    const dateString = dateObj.toISOString().split('T')[0];
    
    // Store first 24 hours as hourly data
    if (index < 8) { // 8 slots * 3 hours = 24 hours
      // Format time
      const h = dateObj.getHours();
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const timeString = `${hour12}:00 ${suffix}`;
      
      hourly.push({
        time: timeString,
        tempC: Math.round(item.main.temp),
        tempF: cToF(Math.round(item.main.temp)),
        conditionText: item.weather[0]?.main || 'Clear',
        conditionCode: mapOwmToCode(item.weather[0]?.id || 800),
        precipProb: Math.round((item.pop || 0) * 100)
      });
    }
    
    // Group for daily forecast
    if (!dailyGroups[dateString]) {
      dailyGroups[dateString] = {
        temps: [],
        conditions: [],
        pop: []
      };
    }
    dailyGroups[dateString].temps.push(item.main.temp);
    dailyGroups[dateString].conditions.push({
      text: item.weather[0]?.main || 'Clear',
      code: mapOwmToCode(item.weather[0]?.id || 800)
    });
    dailyGroups[dateString].pop.push(item.pop || 0);
  });
  
  const forecast = Object.keys(dailyGroups).slice(0, 7).map((dateStr, idx) => {
    const grp = dailyGroups[dateStr];
    const maxTempC = Math.round(Math.max(...grp.temps));
    const minTempC = Math.round(Math.min(...grp.temps));
    const avgPop = grp.pop.reduce((a, b) => a + b, 0) / grp.pop.length;
    
    // Most common condition
    const mostCommonCond = grp.conditions[Math.floor(grp.conditions.length / 2)] || { text: 'Clear', code: 1000 };
    
    const d = new Date(dateStr + 'T12:00:00'); // Standard noon local time
    const dayName = idx === 0 ? 'Today' : days[d.getDay()];
    
    return {
      date: dateStr,
      dayName,
      maxTempC,
      minTempC,
      maxTempF: cToF(maxTempC),
      minTempF: cToF(minTempC),
      conditionText: mostCommonCond.text,
      conditionCode: mostCommonCond.code,
      precipProb: Math.round(avgPop * 100)
    };
  });
  
  return {
    cityName: currentData.name,
    country: currentData.sys.country,
    current: currentInfo,
    hourly: hourly.length > 0 ? hourly : fillHourlyMock(tempC, condCode, condText),
    forecast
  };
}

// Fetch from WeatherAPI.com
async function fetchWeatherApi(cityName, apiKey) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=7&aqi=yes&alerts=no`
  );
  if (!res.ok) {
    throw new Error(`WeatherAPI Error: ${res.statusText} (${res.status})`);
  }
  const data = await res.json();
  
  const current = {
    tempC: Math.round(data.current.temp_c),
    tempF: Math.round(data.current.temp_f),
    conditionText: data.current.condition.text,
    conditionCode: data.current.condition.code,
    humidity: data.current.humidity,
    windKph: Math.round(data.current.wind_kph),
    windDir: data.current.wind_dir,
    feelsLikeC: Math.round(data.current.feelslike_c),
    feelsLikeF: Math.round(data.current.feelslike_f),
    uvIndex: data.current.uv,
    pressureMb: Math.round(data.current.pressure_mb),
    visibilityKm: Math.round(data.current.vis_km),
    sunrise: data.forecast.forecastday[0].astro.sunrise,
    sunset: data.forecast.forecastday[0].astro.sunset,
    aqi: Math.round(data.current.air_quality?.['us-epa-index'] || 1),
    aqiText: getAqiText(data.current.air_quality?.['us-epa-index'] || 1)
  };
  
  // Hourly forecast (we take the upcoming hours from today's/tomorrow's lists)
  const allHourlyRaw = [
    ...data.forecast.forecastday[0].hour,
    ...(data.forecast.forecastday[1]?.hour || [])
  ];
  
  // Find current hour index
  const nowHour = new Date().getHours();
  const hourlySelected = allHourlyRaw.slice(nowHour, nowHour + 24).map(item => {
    const dateObj = new Date(item.time);
    const h = dateObj.getHours();
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    
    return {
      time: `${hour12}:00 ${suffix}`,
      tempC: Math.round(item.temp_c),
      tempF: Math.round(item.temp_f),
      conditionText: item.condition.text,
      conditionCode: item.condition.code,
      precipProb: Math.round(item.chance_of_rain || item.chance_of_snow || 0)
    };
  });
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const forecast = data.forecast.forecastday.map((dayItem, idx) => {
    const d = new Date(dayItem.date + 'T12:00:00');
    const dayName = idx === 0 ? 'Today' : days[d.getDay()];
    
    return {
      date: dayItem.date,
      dayName,
      maxTempC: Math.round(dayItem.day.maxtemp_c),
      minTempC: Math.round(dayItem.day.mintemp_c),
      maxTempF: Math.round(dayItem.day.maxtemp_f),
      minTempF: Math.round(dayItem.day.mintemp_f),
      conditionText: dayItem.day.condition.text,
      conditionCode: dayItem.day.condition.code,
      precipProb: Math.round(dayItem.day.daily_chance_of_rain || dayItem.day.daily_chance_of_snow || 0)
    };
  });
  
  return {
    cityName: data.location.name,
    country: data.location.country,
    current,
    hourly: hourlySelected,
    forecast
  };
}

// Helpers
function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function formatTime(unixTimestamp, timezoneOffset) {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  // Using UTC as offset is already added
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function getAqiText(index) {
  const texts = {
    1: 'Good',
    2: 'Moderate',
    3: 'Unhealthy for Sensitive Groups',
    4: 'Unhealthy',
    5: 'Very Unhealthy',
    6: 'Hazardous'
  };
  return texts[index] || 'Unknown';
}

function fillHourlyMock(baseTemp, condCode, condText) {
  const arr = [];
  for (let i = 0; i < 24; i++) {
    const h = (new Date().getHours() + i) % 24;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    arr.push({
      time: `${hour12}:00 ${suffix}`,
      tempC: baseTemp + Math.round(Math.sin((i / 24) * 2 * Math.PI) * 4),
      tempF: cToF(baseTemp + Math.round(Math.sin((i / 24) * 2 * Math.PI) * 4)),
      conditionText: condText,
      conditionCode: condCode,
      precipProb: 10
    });
  }
  return arr;
}

// Exported Primary Method
export async function getWeatherData(cityName, config) {
  const { useLiveApi, apiProvider, apiKey } = config || {};
  
  if (useLiveApi && apiKey) {
    try {
      if (apiProvider === 'weatherapi') {
        return await fetchWeatherApi(cityName, apiKey);
      } else {
        return await fetchOpenWeatherMap(cityName, apiKey);
      }
    } catch (error) {
      console.warn(`Error fetching live weather, falling back to mock data:`, error);
      throw error; // Re-throw so the UI can notify the user, or catch and fallback
    }
  }
  
  // Return mock data by default
  // Add a small artificial network latency to simulate real network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockWeatherData(cityName));
    }, 450);
  });
}
