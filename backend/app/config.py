from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"
    ollama_embed_model: str = "nomic-embed-text"
    ollama_num_ctx: int = 2048
    ollama_num_predict: int = 256
    ollama_temperature: float = 0.7

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
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
