import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather, useAQI } from '@/hooks';
import { useWeatherStore } from '@/store';
import { WeatherCard } from '@/components/WeatherCard';
import { AQIBadge } from '@/components/AQIBadge';
import { ForecastChart } from '@/components/ForecastChart';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { getWeatherIcon } from '@/constants/theme';

export default function HomeScreen() {
  const { currentLocation } = useWeatherStore();
  const { weather, isLoading, isError, refetch, isFetching } = useWeather();
  const { aqi } = useAQI();

  if (isLoading && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load weather</Text>
          <Text style={styles.errorSubtext}>Check your connection and try again</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.location}>{weather?.location || currentLocation.name}</Text>
          <Text style={styles.updateTime}>
            {weather?.updated_at
              ? `Updated ${new Date(weather.updated_at).toLocaleTimeString()}`
              : ''}
          </Text>
        </View>

        {/* Current Weather */}
        {weather && (
          <View style={styles.currentWeather}>
            <Text style={styles.weatherIcon}>
              {getWeatherIcon(weather.current.weather_code)}
            </Text>
            <Text style={styles.temperature}>
              {Math.round(weather.current.temperature)}°
            </Text>
            <Text style={styles.feelsLike}>
              Feels like {Math.round(weather.current.feels_like)}°
            </Text>
            <Text style={styles.description}>{weather.current.description}</Text>

            {/* AQI Badge */}
            {aqi && aqi.available && (
              <View style={styles.aqiContainer}>
                <AQIBadge aqi={aqi.aqi} category={aqi.category} />
              </View>
            )}
          </View>
        )}

        {/* Weather Details */}
        {weather && (
          <View style={styles.detailsRow}>
            <WeatherCard
              icon="💧"
              label="Humidity"
              value={`${weather.current.humidity}%`}
            />
            <WeatherCard
              icon="💨"
              label="Wind"
              value={`${Math.round(weather.current.wind_speed)} km/h`}
            />
          </View>
        )}

        {/* Hourly Forecast */}
        {weather && weather.hourly.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hourly Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.hourlyContainer}>
                {weather.hourly.slice(0, 12).map((hour, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={styles.hourlyTime}>
                      {new Date(hour.time).toLocaleTimeString([], {
                        hour: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.hourlyIcon}>
                      {getWeatherIcon(hour.weather_code)}
                    </Text>
                    <Text style={styles.hourlyTemp}>
                      {Math.round(hour.temperature)}°
                    </Text>
                    <Text style={styles.hourlyPrecip}>
                      {hour.precipitation_probability}%
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 7-Day Forecast */}
        {weather && weather.daily.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            {weather.daily.map((day, index) => (
              <View key={index} style={styles.dailyItem}>
                <Text style={styles.dailyDay}>
                  {index === 0
                    ? 'Today'
                    : new Date(day.date).toLocaleDateString([], {
                        weekday: 'short',
                      })}
                </Text>
                <View style={styles.dailyCenter}>
                  <Text style={styles.dailyIcon}>
                    {getWeatherIcon(day.weather_code)}
                  </Text>
                  <Text style={styles.dailyPrecip}>
                    {day.precipitation_probability}%
                  </Text>
                </View>
                <View style={styles.dailyTemps}>
                  <Text style={styles.dailyHigh}>
                    {Math.round(day.temp_max)}°
                  </Text>
                  <Text style={styles.dailyLow}>
                    {Math.round(day.temp_min)}°
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  errorSubtext: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginTop: Spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  location: {
    color: Colors.text,
    fontSize: FontSizes.xxl,
    fontWeight: '600',
  },
  updateTime: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  weatherIcon: {
    fontSize: 80,
    marginBottom: Spacing.sm,
  },
  temperature: {
    color: Colors.text,
    fontSize: FontSizes.hero,
    fontWeight: '300',
  },
  feelsLike: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  description: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    marginTop: Spacing.sm,
    textTransform: 'capitalize',
  },
  aqiContainer: {
    marginTop: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  hourlyContainer: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    minWidth: 70,
  },
  hourlyTime: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  hourlyIcon: {
    fontSize: 24,
    marginVertical: Spacing.xs,
  },
  hourlyTemp: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  hourlyPrecip: {
    color: Colors.rainy,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dailyDay: {
    color: Colors.text,
    fontSize: FontSizes.md,
    width: 60,
  },
  dailyCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dailyIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  dailyPrecip: {
    color: Colors.rainy,
    fontSize: FontSizes.sm,
  },
  dailyTemps: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
  },
  dailyHigh: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  dailyLow: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
});
