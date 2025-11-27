from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from datetime import datetime
import json

from .config import get_settings
from .models import (
    WeatherResponse, GeocodeResponse, AQIResponse,
    ChatRequest, ChatResponse, Citation,
    IngestRequest, IngestResponse, HealthResponse
)
from .services.weather import WeatherService
from .services.geocode import GeocodeService
from .services.aqi import AQIService
from .services.rag import RAGService
from .services.ollama import OllamaService
from .services.qdrant import QdrantService

settings = get_settings()

app = FastAPI(
    title="Weather AI Assistant API",
    description="Backend for Weather App with RAG-powered chat",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
weather_service = WeatherService()
geocode_service = GeocodeService()
aqi_service = AQIService()
ollama_service = OllamaService()
qdrant_service = QdrantService()
rag_service = RAGService(ollama_service, qdrant_service)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    ollama_ok = await ollama_service.check_health()
    qdrant_ok = await qdrant_service.check_health()

    return HealthResponse(
        status="healthy" if ollama_ok and qdrant_ok else "degraded",
        ollama=ollama_ok,
        qdrant=qdrant_ok,
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/weather", response_model=WeatherResponse)
async def get_weather(
    lat: float = Query(default=settings.default_lat, description="Latitude"),
    lon: float = Query(default=settings.default_lon, description="Longitude"),
    units: str = Query(default="metric", description="Units: metric or imperial")
):
    """Get current weather and forecast"""
    try:
        return await weather_service.get_weather(lat, lon, units)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/geocode", response_model=GeocodeResponse)
async def geocode(
    q: str = Query(..., description="City name to search"),
    limit: int = Query(default=5, description="Max results")
):
    """Search for cities by name"""
    try:
        return await geocode_service.search(q, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/aqi", response_model=AQIResponse)
async def get_aqi(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get air quality index"""
    try:
        return await aqi_service.get_aqi(lat, lon)
    except Exception as e:
        # Return unavailable AQI on error
        return AQIResponse(
            aqi=0,
            category="Unknown",
            available=False
        )


@app.post("/chat")
async def chat(request: ChatRequest):
    """RAG-powered chat with streaming response"""

    async def generate():
        citations = []
        full_response = ""

        try:
            # Get relevant context from RAG
            context_docs = await rag_service.get_context(request.message)
            citations = [
                Citation(
                    source=doc["source"],
                    content=doc["content"][:200],
                    score=doc["score"]
                )
                for doc in context_docs
            ]

            # Build prompt with context
            context_text = "\n\n".join([
                f"[{doc['source']}]: {doc['content']}"
                for doc in context_docs
            ])

            # Add weather context if location provided
            weather_context = ""
            if request.lat and request.lon:
                try:
                    weather = await weather_service.get_weather(
                        request.lat, request.lon, "metric"
                    )
                    weather_context = f"""
Current weather in {weather.location}:
- Temperature: {weather.current.temperature}°C (feels like {weather.current.feels_like}°C)
- Conditions: {weather.current.description}
- Humidity: {weather.current.humidity}%
- Wind: {weather.current.wind_speed} km/h
"""
                except:
                    pass

            system_prompt = f"""You are a helpful weather assistant. Use the following knowledge base context and current weather data to answer questions accurately. Always cite your sources when using information from the knowledge base.

Knowledge Base Context:
{context_text}

{weather_context}

Guidelines:
- Be concise and helpful
- For weather data, use the current weather information provided
- For explanations about weather concepts, UV, AQI, safety tips, cite the knowledge base
- If you don't know something, say so
- If the user asks about a specific time or location not provided, ask for clarification"""

            # Stream response from Ollama
            async for chunk in ollama_service.generate_stream(
                system_prompt=system_prompt,
                user_message=request.message,
                history=request.history
            ):
                full_response += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            # Send citations at the end
            yield f"data: {json.dumps({'type': 'citations', 'citations': [c.model_dump() for c in citations]})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(request: IngestRequest):
    """Ingest a document into the knowledge base"""
    try:
        if request.file_path:
            with open(request.file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        elif request.content:
            content = request.content
        else:
            raise HTTPException(
                status_code=400,
                detail="Either file_path or content must be provided"
            )

        chunks_added = await rag_service.ingest(content, request.source)

        return IngestResponse(
            success=True,
            chunks_added=chunks_added,
            message=f"Successfully ingested {chunks_added} chunks from {request.source}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
