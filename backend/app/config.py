from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # GCP / Vertex AI
    gcp_project_id: Optional[str] = None
    gcp_location: str = "us-central1"
    gemini_model: str = "gemini-1.5-flash-001"
    embedding_model: str = "text-embedding-004"
    gemini_temperature: float = 0.7
    gemini_max_output_tokens: int = 256

    # Qdrant Cloud
    qdrant_url: Optional[str] = None
    qdrant_api_key: Optional[str] = None
    qdrant_collection: str = "weather_kb"
    qdrant_top_k: int = 4

    # External APIs
    open_meteo_url: str = "https://api.open-meteo.com/v1"
    open_meteo_geocode_url: str = "https://geocoding-api.open-meteo.com/v1"
    nominatim_url: str = "https://nominatim.openstreetmap.org"
    openaq_url: str = "https://api.openaq.org/v2"

    # Default location (New York)
    default_lat: float = 40.7128
    default_lon: float = -74.0060
    default_city: str = "New York"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
