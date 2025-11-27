import httpx
from ..config import get_settings
from ..models import GeocodeResponse, GeoLocation

settings = get_settings()


class GeocodeService:
    def __init__(self):
        self.open_meteo_url = settings.open_meteo_geocode_url
        self.nominatim_url = settings.nominatim_url

    async def search(self, query: str, limit: int = 5) -> GeocodeResponse:
        """Search for locations by name, with Nominatim fallback"""
        try:
            # Try Open-Meteo first
            results = await self._search_open_meteo(query, limit)
            if results:
                return GeocodeResponse(results=results)
        except:
            pass

        # Fallback to Nominatim
        try:
            results = await self._search_nominatim(query, limit)
            return GeocodeResponse(results=results)
        except Exception as e:
            return GeocodeResponse(results=[])

    async def _search_open_meteo(
        self, query: str, limit: int
    ) -> list[GeoLocation]:
        """Search using Open-Meteo Geocoding API"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.open_meteo_url}/search",
                params={
                    "name": query,
                    "count": limit,
                    "language": "en",
                    "format": "json"
                },
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get("results", []):
            results.append(GeoLocation(
                name=item["name"],
                lat=item["latitude"],
                lon=item["longitude"],
                country=item.get("country", ""),
                state=item.get("admin1")
            ))
        return results

    async def _search_nominatim(
        self, query: str, limit: int
    ) -> list[GeoLocation]:
        """Search using Nominatim API (fallback)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.nominatim_url}/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": limit,
                    "addressdetails": 1
                },
                headers={"User-Agent": "WeatherApp/1.0"},
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data:
            address = item.get("address", {})
            name = (
                address.get("city") or
                address.get("town") or
                address.get("village") or
                item.get("display_name", "").split(",")[0]
            )
            results.append(GeoLocation(
                name=name,
                lat=float(item["lat"]),
                lon=float(item["lon"]),
                country=address.get("country", ""),
                state=address.get("state")
            ))
        return results
