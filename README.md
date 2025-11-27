# Weather AI App

A Perplexity-style mobile weather app with an AI chat assistant running entirely on local hardware.

## Features

- **Home**: Current weather, AQI, hourly/7-day forecast
- **Chat**: Streaming AI responses with RAG citations from local knowledge base
- **Search**: City search with saved locations
- **Visualization**: Interactive temperature and precipitation charts
- **Settings**: Units, privacy controls

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Native   │────▶│    FastAPI       │────▶│   Ollama        │
│  Expo App       │     │    Backend       │     │   (LLM)         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │   Qdrant     │         │ nomic-embed  │
                        │  (Vectors)   │         │   (Embed)    │
                        └──────────────┘         └──────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile App | React Native Expo + TypeScript |
| State | Zustand + React Query |
| Backend | FastAPI (Python) |
| LLM | Ollama + llama3.2:3b |
| Embeddings | nomic-embed-text |
| Vector DB | Qdrant |
| Weather Data | Open-Meteo (free) |
| AQI Data | OpenAQ |

## Requirements

- **GPU**: NVIDIA GTX 1660 Ti 6GB (or equivalent)
- **Docker**: For Qdrant
- **Node.js**: 18+
- **Python**: 3.10+
- **Ollama**: Latest version

---

## Runbook

### 1. Install Ollama & Pull Models

```bash
# Install Ollama (Windows)
# Download from https://ollama.ai/download

# Pull required models
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# Verify models
ollama list
```

### 2. Start Qdrant (Docker)

```bash
cd Weather_app/backend

# Start Qdrant
docker-compose up -d

# Verify Qdrant is running
curl http://localhost:6333/collections
```

### 3. Setup Backend

```bash
cd Weather_app/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux
```

### 4. Ingest Knowledge Base

```bash
cd Weather_app/backend

# Make sure Ollama is running
ollama serve  # In a separate terminal if not running

# Ingest KB documents
python -m scripts.ingest_kb
```

Expected output:
```
==================================================
Weather App Knowledge Base Ingestion
==================================================
[1/4] Initializing services...
[2/4] Checking service health...
✅ Ollama is running
✅ Qdrant is running
[3/4] Found 5 KB files...
[4/4] Ingesting documents...
==================================================
Ingestion Complete!
Total chunks in collection: ~25-30
==================================================
```

### 5. Start Backend Server

```bash
cd Weather_app/backend

# Start FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or with Python
python -m app.main
```

Backend available at: http://localhost:8000

API docs: http://localhost:8000/docs

### 6. Setup Mobile App

```bash
cd Weather_app/mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

### 7. Configure API URL

Edit `mobile/services/api.ts`:

```typescript
// For local development
const API_BASE_URL = 'http://localhost:8000';

// For device testing (use your computer's IP)
const API_BASE_URL = 'http://192.168.x.x:8000';
```

### 8. Run the App

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

---

## Test Checklist

### Backend Tests

```bash
# Health check
curl http://localhost:8000/health

# Weather endpoint
curl "http://localhost:8000/weather?lat=40.7128&lon=-74.0060"

# Geocode endpoint
curl "http://localhost:8000/geocode?q=London"

# AQI endpoint
curl "http://localhost:8000/aqi?lat=40.7128&lon=-74.0060"
```

### Chat Test

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is UV index?"}'
```

### Checklist

- [ ] `/health` returns status with ollama=true, qdrant=true
- [ ] `/weather` returns current + forecast data
- [ ] `/geocode` finds cities correctly
- [ ] `/aqi` returns AQI (or graceful fallback)
- [ ] `/chat` streams tokens correctly
- [ ] RAG citations appear in chat responses
- [ ] Home screen loads weather data
- [ ] Chart visualization renders
- [ ] Settings persist across restarts
- [ ] City search works

---

## Ollama Configuration (6GB VRAM)

Safe parameters for GTX 1660 Ti 6GB:

```python
OLLAMA_CONFIG = {
    "model": "llama3.2:3b",
    "options": {
        "num_ctx": 2048,      # Context window
        "num_predict": 256,   # Max tokens to generate
        "temperature": 0.7,
        "top_p": 0.9,
    }
}
```

If you experience OOM errors:
- Reduce `num_ctx` to 1024
- Reduce `num_predict` to 128
- Close other GPU-intensive applications

---

## Project Structure

```
Weather_app/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI routes
│   │   ├── config.py         # Settings
│   │   ├── models.py         # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── scripts/
│   │   └── ingest_kb.py      # KB ingestion
│   ├── requirements.txt
│   └── docker-compose.yml
│
├── mobile/
│   ├── app/
│   │   └── (tabs)/           # Screen components
│   ├── components/           # Reusable UI
│   ├── hooks/                # React hooks
│   ├── store/                # Zustand stores
│   ├── services/             # API client
│   └── package.json
│
├── kb/                       # Knowledge base docs
│   ├── weather-terms.md
│   ├── uv-aqi-basics.md
│   ├── thunderstorm-safety.md
│   ├── heat-cold-safety.md
│   └── wind-rain-planning.md
│
└── README.md
```

---

## Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
ollama serve

# Test model
ollama run llama3.2:3b "Hello"
```

### Qdrant connection failed
```bash
# Check Docker container
docker ps
docker logs weather-qdrant

# Restart Qdrant
docker-compose down && docker-compose up -d
```

### Mobile app can't connect to backend
- Ensure backend is running on 0.0.0.0 (not 127.0.0.1)
- Use computer's local IP for device testing
- Check firewall settings

### Out of VRAM
- Close other applications using GPU
- Reduce Ollama context size
- Use smaller model variant

---

## License

MIT
