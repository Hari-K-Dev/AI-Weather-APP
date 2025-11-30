from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Weather Models
class CurrentWeather(BaseModel):
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    wind_direction: int
    weather_code: int
    description: str
    icon: str


class HourlyForecast(BaseModel):
    time: str
    temperature: float
    weather_code: int
    precipitation_probability: int


class DailyForecast(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    weather_code: int
    description: str
    precipitation_probability: int
    sunrise: str
    sunset: str


class WeatherResponse(BaseModel):
    location: str
    lat: float
    lon: float
    current: CurrentWeather
    hourly: list[HourlyForecast]
    daily: list[DailyForecast]
    timezone: str
    updated_at: str


# Geocoding Models
class GeoLocation(BaseModel):
    name: str
    lat: float
    lon: float
    country: str
    state: Optional[str] = None


class GeocodeResponse(BaseModel):
    results: list[GeoLocation]


# AQI Models
class AQIResponse(BaseModel):
    aqi: int
    category: str
    dominant_pollutant: Optional[str] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None
    available: bool = True


# Chat Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class Citation(BaseModel):
    source: str
    content: str
    score: float


class ChatResponse(BaseModel):
    response: str
    citations: list[Citation]


# Ingest Models
class IngestRequest(BaseModel):
    file_path: Optional[str] = None
    content: Optional[str] = None
    source: str


class IngestResponse(BaseModel):
    success: bool
    chunks_added: int
    message: str


# Health Models
class HealthResponse(BaseModel):
    status: str
    vertex_ai: bool
    qdrant: bool
    timestamp: str
