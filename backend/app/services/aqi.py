import httpx
from ..config import get_settings
from ..models import AQIResponse

settings = get_settings()


def get_aqi_category(aqi: int) -> str:
    """Convert AQI value to category"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


class AQIService:
    def __init__(self):
        self.base_url = settings.openaq_url

    async def get_aqi(self, lat: float, lon: float) -> AQIResponse:
        """Get air quality data from OpenAQ"""
        try:
            # Find nearest location
            async with httpx.AsyncClient() as client:
                # Search for nearest monitoring station
                response = await client.get(
                    f"{self.base_url}/locations",
                    params={
                        "coordinates": f"{lat},{lon}",
                        "radius": 50000,  # 50km radius
                        "limit": 1,
                        "order_by": "distance"
                    },
                    timeout=10.0
                )

                if response.status_code != 200:
                    return self._unavailable_response()

                data = response.json()
                results = data.get("results", [])

                if not results:
                    return self._unavailable_response()

                location = results[0]
                location_id = location["id"]

                # Get latest measurements
                measurements_response = await client.get(
                    f"{self.base_url}/latest/{location_id}",
                    timeout=10.0
                )

                if measurements_response.status_code != 200:
                    return self._unavailable_response()

                measurements_data = measurements_response.json()
                measurements = measurements_data.get("results", [])

                if not measurements:
                    return self._unavailable_response()

                # Parse measurements
                pm25 = None
                pm10 = None
                o3 = None
                no2 = None

                for m in measurements[0].get("measurements", []):
                    param = m.get("parameter")
                    value = m.get("value")
                    if param == "pm25":
                        pm25 = value
                    elif param == "pm10":
                        pm10 = value
                    elif param == "o3":
                        o3 = value
                    elif param == "no2":
                        no2 = value

                # Calculate AQI (simplified - using PM2.5 as primary)
                aqi = self._calculate_aqi(pm25, pm10, o3, no2)
                dominant = self._get_dominant_pollutant(pm25, pm10, o3, no2)

                return AQIResponse(
                    aqi=aqi,
                    category=get_aqi_category(aqi),
                    dominant_pollutant=dominant,
                    pm25=pm25,
                    pm10=pm10,
                    o3=o3,
                    no2=no2,
                    available=True
                )

        except Exception as e:
            return self._unavailable_response()

    def _unavailable_response(self) -> AQIResponse:
        return AQIResponse(
            aqi=0,
            category="Unknown",
            available=False
        )

    def _calculate_aqi(
        self,
        pm25: float | None,
        pm10: float | None,
        o3: float | None,
        no2: float | None
    ) -> int:
        """Calculate AQI from pollutant concentrations (simplified)"""
        # Simplified AQI calculation using PM2.5 as primary indicator
        if pm25 is not None:
            # EPA breakpoints for PM2.5 (μg/m³)
            if pm25 <= 12.0:
                return int((50 / 12.0) * pm25)
            elif pm25 <= 35.4:
                return int(50 + (50 / 23.4) * (pm25 - 12.0))
            elif pm25 <= 55.4:
                return int(100 + (50 / 20.0) * (pm25 - 35.4))
            elif pm25 <= 150.4:
                return int(150 + (50 / 95.0) * (pm25 - 55.4))
            elif pm25 <= 250.4:
                return int(200 + (100 / 100.0) * (pm25 - 150.4))
            else:
                return int(300 + (100 / 149.6) * (pm25 - 250.4))

        # Fallback to PM10 if PM2.5 not available
        if pm10 is not None:
            if pm10 <= 54:
                return int((50 / 54) * pm10)
            elif pm10 <= 154:
                return int(50 + (50 / 100) * (pm10 - 54))
            else:
                return min(int(100 + (pm10 - 154) * 0.5), 500)

        return 0

    def _get_dominant_pollutant(
        self,
        pm25: float | None,
        pm10: float | None,
        o3: float | None,
        no2: float | None
    ) -> str | None:
        """Determine dominant pollutant"""
        pollutants = {
            "PM2.5": pm25,
            "PM10": pm10,
            "O3": o3,
            "NO2": no2
        }

        # Filter out None values
        valid = {k: v for k, v in pollutants.items() if v is not None}
        if not valid:
            return None

        # Return the one with highest relative value (simplified)
        return max(valid, key=lambda k: valid[k])
