import httpx
from datetime import datetime
from ..config import get_settings
from ..models import (
    WeatherResponse, CurrentWeather, HourlyForecast, DailyForecast
)

settings = get_settings()

# WMO Weather interpretation codes
WMO_CODES = {
    0: ("Clear sky", "☀️"),
    1: ("Mainly clear", "🌤️"),
    2: ("Partly cloudy", "⛅"),
    3: ("Overcast", "☁️"),
    45: ("Foggy", "🌫️"),
    48: ("Depositing rime fog", "🌫️"),
    51: ("Light drizzle", "🌧️"),
    53: ("Moderate drizzle", "🌧️"),
    55: ("Dense drizzle", "🌧️"),
    61: ("Slight rain", "🌧️"),
    63: ("Moderate rain", "🌧️"),
    65: ("Heavy rain", "🌧️"),
    66: ("Light freezing rain", "🌨️"),
    67: ("Heavy freezing rain", "🌨️"),
    71: ("Slight snow", "🌨️"),
    73: ("Moderate snow", "🌨️"),
    75: ("Heavy snow", "❄️"),
    77: ("Snow grains", "🌨️"),
    80: ("Slight rain showers", "🌦️"),
    81: ("Moderate rain showers", "🌦️"),
    82: ("Violent rain showers", "⛈️"),
    85: ("Slight snow showers", "🌨️"),
    86: ("Heavy snow showers", "🌨️"),
    95: ("Thunderstorm", "⛈️"),
    96: ("Thunderstorm with slight hail", "⛈️"),
    99: ("Thunderstorm with heavy hail", "⛈️"),
}


def get_weather_description(code: int) -> tuple[str, str]:
    return WMO_CODES.get(code, ("Unknown", "❓"))


class WeatherService:
    def __init__(self):
        self.base_url = settings.open_meteo_url

    async def get_weather(
        self, lat: float, lon: float, units: str = "metric"
    ) -> WeatherResponse:
        """Fetch weather from Open-Meteo API"""

        # Convert units
        temp_unit = "celsius" if units == "metric" else "fahrenheit"
        wind_unit = "kmh" if units == "metric" else "mph"

        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "weather_code",
                "wind_speed_10m",
                "wind_direction_10m"
            ],
            "hourly": [
                "temperature_2m",
                "weather_code",
                "precipitation_probability"
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max",
                "sunrise",
                "sunset"
            ],
            "temperature_unit": temp_unit,
            "wind_speed_unit": wind_unit,
            "timezone": "auto",
            "forecast_days": 7
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/forecast",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()

        # Parse current weather
        current_data = data["current"]
        weather_code = current_data["weather_code"]
        description, icon = get_weather_description(weather_code)

        current = CurrentWeather(
            temperature=current_data["temperature_2m"],
            feels_like=current_data["apparent_temperature"],
            humidity=current_data["relative_humidity_2m"],
            wind_speed=current_data["wind_speed_10m"],
            wind_direction=current_data["wind_direction_10m"],
            weather_code=weather_code,
            description=description,
            icon=icon
        )

        # Parse hourly forecast (next 24 hours)
        hourly_data = data["hourly"]
        hourly = []
        for i in range(24):
            hourly.append(HourlyForecast(
                time=hourly_data["time"][i],
                temperature=hourly_data["temperature_2m"][i],
                weather_code=hourly_data["weather_code"][i],
                precipitation_probability=hourly_data["precipitation_probability"][i] or 0
            ))

        # Parse daily forecast
        daily_data = data["daily"]
        daily = []
        for i in range(len(daily_data["time"])):
            code = daily_data["weather_code"][i]
            desc, _ = get_weather_description(code)
            daily.append(DailyForecast(
                date=daily_data["time"][i],
                temp_max=daily_data["temperature_2m_max"][i],
                temp_min=daily_data["temperature_2m_min"][i],
                weather_code=code,
                description=desc,
                precipitation_probability=daily_data["precipitation_probability_max"][i] or 0,
                sunrise=daily_data["sunrise"][i],
                sunset=daily_data["sunset"][i]
            ))

        # Get location name (reverse geocode)
        location_name = await self._reverse_geocode(lat, lon)

        return WeatherResponse(
            location=location_name,
            lat=lat,
            lon=lon,
            current=current,
            hourly=hourly,
            daily=daily,
            timezone=data.get("timezone", "UTC"),
            updated_at=datetime.utcnow().isoformat()
        )

    async def _reverse_geocode(self, lat: float, lon: float) -> str:
        """Get location name from coordinates"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.nominatim_url}/reverse",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "format": "json"
                    },
                    headers={"User-Agent": "WeatherApp/1.0"},
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    address = data.get("address", {})
                    city = (
                        address.get("city") or
                        address.get("town") or
                        address.get("village") or
                        address.get("county", "Unknown")
                    )
                    return city
        except:
            pass
        return f"{lat:.2f}, {lon:.2f}"
