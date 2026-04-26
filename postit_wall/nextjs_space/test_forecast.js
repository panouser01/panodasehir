const result = await fetch("https://api.open-meteo.com/v1/forecast?latitude=38.4237,39.4237&longitude=27.1428,28.1428&current=temperature_2m,weather_code,is_day,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,precipitation_probability_max&hourly=temperature_2m,weather_code&timezone=Europe/Istanbul");
const data = await result.json();
console.log(JSON.stringify(data[0].daily, null, 2).substring(0, 500));
console.log(JSON.stringify(data[0].current, null, 2));
