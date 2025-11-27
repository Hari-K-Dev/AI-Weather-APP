import { WeatherData, GeocodeResponse, AQIData, HealthStatus } from '@/types';
import { config } from '@/utils/config';



class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  // Weather endpoints
  async getWeather(lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> {
    return this.get<WeatherData>('/weather', { lat, lon, units });
  }

  // Geocoding endpoints
  async searchCities(query: string, limit: number = 5): Promise<GeocodeResponse> {
    return this.get<GeocodeResponse>('/geocode', { q: query, limit });
  }

  // AQI endpoints
  async getAQI(lat: number, lon: number): Promise<AQIData> {
    return this.get<AQIData>('/aqi', { lat, lon });
  }

  // Health check
  async checkHealth(): Promise<HealthStatus> {
    return this.get<HealthStatus>('/health');
  }

  // Chat streaming
  async *streamChat(
    message: string,
    history: { role: string; content: string }[],
    location?: string,
    lat?: number,
    lon?: number
  ): AsyncGenerator<{ type: string; content?: string; citations?: unknown[]; message?: string }> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        location,
        lat,
        lon,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

export const api = new ApiClient();
export default api;
