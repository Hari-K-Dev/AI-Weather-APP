# Weather AI App - Frontend Documentation

> **IMPORTANT: Web-First Development**
>
> This application should be built **primarily for the web platform**. All library choices and implementations must be web-compatible. Avoid using libraries that have native-only dependencies or don't work properly in browser environments.

## Overview
A React Native Expo application for weather tracking with AI-powered chat capabilities. The app uses a tab-based navigation system with 5 main screens and connects to a FastAPI backend.

## Tech Stack (Web-Compatible Only)

| Technology | Package | Web Compatible | Notes |
|------------|---------|----------------|-------|
| Framework | React Native + Expo SDK | Yes | Use web-first approach |
| Navigation | expo-router | Yes | File-based routing works on web |
| State Management | **zustand@^4.x** | Yes | **DO NOT use v5** - breaks web builds |
| Server State | @tanstack/react-query | Yes | Fully web compatible |
| Icons | @expo/vector-icons | Yes | Ionicons work on web |
| Storage | localStorage | Yes | Primary for web |
| HTTP Client | Native fetch API | Yes | Built into browsers |
| Charts | CSS/HTML divs | Yes | Avoid react-native-svg for charts |

### Libraries to AVOID (Not Web Compatible)
- `zustand@^5.x` - Uses `import.meta.env` which breaks Metro bundler for web
- `react-native-svg` for complex charts - Has web compatibility issues
- `expo-location` for GPS - Use browser's Geolocation API instead on web
- Any library with native-only dependencies
- Libraries that use `import.meta` syntax

### Web-Safe Alternatives
| Instead of | Use |
|------------|-----|
| zustand v5 | zustand v4.5.x |
| react-native-svg charts | CSS-based charts with View/div elements |
| expo-location | Browser Geolocation API (`navigator.geolocation`) |
| AsyncStorage | localStorage (for web) |

## Project Structure
```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout with QueryClient
│   └── (tabs)/
│       ├── _layout.tsx      # Tab navigation config
│       ├── index.tsx        # Weather home screen
│       ├── chat.tsx         # AI chat screen
│       ├── search.tsx       # City search screen
│       ├── visualization.tsx # Charts screen
│       └── settings.tsx     # Settings screen
├── components/
│   ├── WeatherCard.tsx      # Weather metric card
│   ├── AQIBadge.tsx         # Air quality indicator
│   ├── ForecastChart.tsx    # Weekly forecast bars (use CSS, not SVG)
│   ├── ChatMessage.tsx      # Chat bubble with citations
│   ├── ChatInput.tsx        # Message input field
│   ├── CitySearchInput.tsx  # Search bar component
│   ├── SettingsToggle.tsx   # Toggle switch
│   └── ErrorBoundary.tsx    # Error handler
├── hooks/
│   ├── useWeather.ts        # Weather data fetching
│   ├── useAQI.ts            # AQI data fetching
│   ├── useGeocode.ts        # City search
│   ├── useChat.ts           # Chat streaming logic
│   └── index.ts             # Export barrel
├── store/
│   ├── weatherStore.ts      # Location & weather cache
│   ├── settingsStore.ts     # User preferences
│   ├── chatStore.ts         # Chat messages
│   └── index.ts             # Export barrel
├── services/
│   ├── api.ts               # API client class
│   └── index.ts             # Export barrel
├── types/
│   └── index.ts             # TypeScript interfaces
├── utils/
│   ├── storage.ts           # Web-first storage (localStorage)
│   ├── config.ts            # API URL configuration
│   └── index.ts             # Export barrel
└── constants/
    └── theme.ts             # Colors, spacing, helpers
```

---

## Navigation Structure

### Root Layout (`app/_layout.tsx`)
Wraps the app with:
- `ErrorBoundary` - Global error catching
- `QueryClientProvider` - TanStack React Query
- `StatusBar` - Light style
- `Stack` navigator with `(tabs)` as the only screen

### Tab Layout (`app/(tabs)/_layout.tsx`)
5-tab bottom navigation:

| Tab | Screen | Icon | Header |
|-----|--------|------|--------|
| Weather | index.tsx | partly-sunny | Hidden |
| Chat | chat.tsx | chatbubbles | "Weather Assistant" |
| Search | search.tsx | search | "Search Cities" |
| Charts | visualization.tsx | stats-chart | "Weather Forecast" |
| Settings | settings.tsx | settings | "Settings" |

**Tab Bar Styling**:
- Background: `Colors.surface` (#1A1A1A)
- Active: `Colors.primary` (#22C55E)
- Inactive: `Colors.textMuted` (#666666)
- Height: 60px

---

## Screen Details

### 1. Home Screen (`index.tsx`)
**Purpose**: Display current weather and forecasts

**Features**:
- Pull-to-refresh (works on web via onClick refresh button)
- Loading/error states
- Location name header with last update time
- Current weather: large icon, temperature, feels-like, description
- AQI badge (when available)
- Weather cards: humidity, wind speed
- Horizontal scrollable hourly forecast (12 hours)
- Vertical 7-day forecast list

**Hooks Used**: `useWeather()`, `useAQI()`, `useWeatherStore()`

**Key Components**: `WeatherCard`, `AQIBadge`, `ForecastChart`

### 2. Chat Screen (`chat.tsx`)
**Purpose**: AI-powered weather assistant

**Features**:
- Empty state with suggestion prompts
- Message list with streaming indicator
- Auto-scroll to bottom on new messages
- Keyboard avoiding behavior
- Chat input with send button

**Hooks Used**: `useChat()`

**Key Components**: `ChatMessage`, `ChatInput`

**Empty State Suggestions**:
- "What's the UV index today?"
- "Should I bring an umbrella?"
- "What does AQI mean?"
- "Is it safe to go hiking?"

### 3. Search Screen (`search.tsx`)
**Purpose**: Search and select cities

**Features**:
- Search input with clear button
- Horizontal chips for saved locations
- Recent searches list (tap to search again)
- Search results with name, state, country
- Selecting a city updates `currentLocation` and navigates to home

**Hooks Used**: `useGeocode()`, `useWeatherStore()`

**Key Components**: `CitySearchInput`

### 4. Visualization Screen (`visualization.tsx`)
**Purpose**: Weather data charts

**Features**:
- Toggle between Temperature and Precipitation views
- **CSS-based bar/line charts** (use View with percentage heights, NOT react-native-svg)
- Interactive data point selection
- Legend and axis labels

**Web-Compatible Chart Implementation**:
```tsx
// Use percentage-based heights with View elements
<View style={{ height: `${(value / maxValue) * 100}%`, backgroundColor: Colors.primary }} />
```

**Data Source**: `cachedWeather.daily` from weatherStore

### 5. Settings Screen (`settings.tsx`)
**Purpose**: User preferences

**Sections**:
1. **Units**: Metric/Imperial toggle
2. **Privacy**: Clear chat history, Clear search history
3. **About**: Version, Weather data source, AI Model info
4. **Reset**: Reset all settings button

**Hooks Used**: `useSettingsStore()`, `useChatStore()`, `useWeatherStore()`

---

## State Management (Zustand v4.x Stores)

> **CRITICAL**: Use `zustand@^4.5.2` NOT v5. Version 5 uses `import.meta.env` which breaks Metro bundler web builds.

### weatherStore
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WeatherState {
  currentLocation: SavedLocation;
  setCurrentLocation: (location: SavedLocation) => void;
  savedLocations: SavedLocation[];
  addSavedLocation: (location: SavedLocation) => void;
  removeSavedLocation: (name: string) => void;
  cachedWeather: WeatherData | null;
  setCachedWeather: (data: WeatherData) => void;
  cachedAQI: AQIData | null;
  setCachedAQI: (data: AQIData) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}
```
- Default location: New York (40.7128, -74.006)
- Persisted to `weather-store` key in localStorage

### settingsStore
```typescript
interface SettingsState extends Settings {
  setUnits: (units: 'metric' | 'imperial') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  reset: () => void;
}
```
- Default: metric, celsius, kmh, dark theme
- Persisted to `weather-settings`

### chatStore
```typescript
interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamingContent: string;
  addUserMessage: (content: string) => string;
  startAssistantMessage: () => string;
  appendToStream: (content: string) => void;
  finishAssistantMessage: (citations?: Citation[]) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
}
```
- Keeps last 50 messages in persistence
- Persisted to `chat-store`

---

## Hooks

### useWeather()
- Fetches weather data via React Query
- Query key: `['weather', lat, lon, units]`
- Stale time: 5 minutes
- Caches result in weatherStore
- Returns: `{ weather, isLoading, isError, error, refetch, isFetching }`

### useAQI()
- Fetches air quality data via React Query
- Query key: `['aqi', lat, lon]`
- Returns: `{ aqi, isLoading, isError }`

### useGeocode(query: string)
- Searches cities when query.length >= 2
- Query key: `['geocode', query]`
- Stale time: 10 minutes
- Returns: `{ results, isLoading, isError }`

### useChat()
- Manages chat interaction with streaming
- Uses SSE (Server-Sent Events) for real-time responses
- Sends last 6 messages as history
- Includes current location context
- Returns: `{ messages, isStreaming, sendMessage, cancelStream, clearMessages }`

---

## API Service (`services/api.ts`)

### ApiClient Class
```typescript
class ApiClient {
  baseUrl: string;

  // HTTP methods
  get<T>(endpoint, params?): Promise<T>
  post<T>(endpoint, body): Promise<T>

  // Weather endpoints
  getWeather(lat, lon, units): Promise<WeatherData>
  searchCities(query, limit?): Promise<GeocodeResponse>
  getAQI(lat, lon): Promise<AQIData>
  checkHealth(): Promise<HealthStatus>

  // Chat (SSE streaming)
  *streamChat(message, history, location?, lat?, lon?): AsyncGenerator
}
```

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /weather | Get weather data |
| GET | /geocode | Search cities |
| GET | /aqi | Get air quality |
| GET | /health | Health check |
| POST | /chat | AI chat (SSE stream) |

### Chat SSE Event Types
- `token`: Streaming text content
- `citations`: Source references
- `done`: Stream complete
- `error`: Error message

---

## Type Definitions

### Weather Types
```typescript
interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
  updated_at: string;
}

interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  weather_code: number;
  description: string;
  icon: string;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  weather_code: number;
  precipitation_probability: number;
}

interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  weather_code: number;
  description: string;
  precipitation_probability: number;
  sunrise: string;
  sunset: string;
}
```

### AQI Types
```typescript
interface AQIData {
  aqi: number;
  category: string;
  dominant_pollutant?: string;
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  available: boolean;
}
```

### Chat Types
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: number;
}

interface Citation {
  source: string;
  content: string;
  score: number;
}
```

### Location Types
```typescript
interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  isDefault?: boolean;
}

interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
```

### Settings Types
```typescript
interface Settings {
  units: 'metric' | 'imperial';
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  theme: 'dark' | 'light';
}
```

---

## Theme & Styling

### Colors
```typescript
const Colors = {
  // Backgrounds
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#252525',

  // Primary
  primary: '#22C55E',      // Green accent
  primaryLight: '#4ADE80',
  primaryDark: '#16A34A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // AQI
  aqiGood: '#22C55E',
  aqiModerate: '#F59E0B',
  aqiUnhealthySensitive: '#F97316',
  aqiUnhealthy: '#EF4444',
  aqiVeryUnhealthy: '#A855F7',
  aqiHazardous: '#7C2D12',

  // Weather
  sunny: '#FCD34D',
  cloudy: '#9CA3AF',
  rainy: '#60A5FA',
  stormy: '#6366F1',
  snowy: '#E5E7EB',

  // Borders
  border: '#333333',
  borderLight: '#444444',
}
```

### Spacing
```typescript
const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

### Font Sizes
```typescript
const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 64,
}
```

### Helper Functions
```typescript
// Get AQI color based on value
getAQIColor(aqi: number): string

// Get weather emoji based on WMO code
getWeatherIcon(code: number): string
```

---

## Web-First Storage Implementation

For web compatibility, use localStorage directly instead of AsyncStorage:

```typescript
// utils/storage.ts - Web-First Implementation
class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

// Zustand adapter for web
export const createZustandStorage = () => ({
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
});
```

---

## Configuration

### API URL Resolution (`utils/config.ts`)
```typescript
const getApiBaseUrl = (): string => {
  // For web, always use localhost in development
  if (typeof window !== 'undefined') {
    return 'http://localhost:8000';
  }
  return 'http://localhost:8000';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDev: process.env.NODE_ENV === 'development',
};
```

---

## Dependencies (Web-Compatible)

### Required Packages
```json
{
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.5.2",
  "expo-router": "latest",
  "@expo/vector-icons": "latest"
}
```

### DO NOT Install
```json
{
  "zustand": "^5.x",
  "@react-native-async-storage/async-storage": "not needed for web-only",
  "expo-location": "use browser Geolocation API",
  "react-native-svg": "use CSS-based charts"
}
```

---

## Known Issues & Web Compatibility Notes

1. **Zustand v5 BREAKS Web Builds**: Uses `import.meta.env` which Metro bundler doesn't support. **Always use v4.5.x**

2. **Storage**: Use `localStorage` directly for web. Don't rely on AsyncStorage polyfills.

3. **Charts**: Build charts using View elements with percentage-based heights instead of SVG libraries.

4. **Chat Streaming**: Uses native fetch with ReadableStream for SSE - this works in all modern browsers.

5. **RefreshControl**: Use a regular button/TouchableOpacity for refresh on web instead of pull-to-refresh.

---

## Implementation Checklist for Another LLM

1. [ ] Create Expo app: `npx create-expo-app@latest --template tabs`
2. [ ] **CRITICAL**: Install zustand v4: `npm install zustand@^4.5.2` (NOT v5!)
3. [ ] Install web-compatible deps: `npm install @tanstack/react-query`
4. [ ] Create folder structure: utils, store, services, types, hooks, constants, components
5. [ ] Implement storage using localStorage (NOT AsyncStorage)
6. [ ] Define types in types/index.ts
7. [ ] Create theme constants
8. [ ] Implement Zustand v4 stores with localStorage persistence
9. [ ] Implement API service with fetch-based SSE streaming
10. [ ] Create React Query hooks
11. [ ] Build components (use CSS-based charts, NOT SVG)
12. [ ] Create screen files
13. [ ] Configure root layout with providers
14. [ ] Configure tab layout with 5 tabs
15. [ ] **Test on web first**: `npx expo start --web`
16. [ ] Verify no `import.meta` errors in browser console
