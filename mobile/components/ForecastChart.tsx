import { View, Text, StyleSheet } from 'react-native';
import { DailyForecast } from '@/types';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { getWeatherIcon } from '@/constants/theme';

interface ForecastChartProps {
  data: DailyForecast[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const temps = data.flatMap((d) => [d.temp_max, d.temp_min]);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp;

  const getBarHeight = (temp: number) => {
    return ((temp - minTemp) / range) * 60 + 20;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Overview</Text>
      <View style={styles.chartContainer}>
        {data.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <Text style={styles.tempHigh}>{Math.round(day.temp_max)}°</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barHigh,
                  { height: getBarHeight(day.temp_max) },
                ]}
              />
              <View
                style={[
                  styles.barLow,
                  { height: getBarHeight(day.temp_min) },
                ]}
              />
            </View>
            <Text style={styles.tempLow}>{Math.round(day.temp_min)}°</Text>
            <Text style={styles.icon}>{getWeatherIcon(day.weather_code)}</Text>
            <Text style={styles.dayLabel}>
              {index === 0
                ? 'Today'
                : new Date(day.date).toLocaleDateString([], {
                    weekday: 'short',
                  })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  tempHigh: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  barContainer: {
    height: 80,
    width: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    marginVertical: Spacing.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barHigh: {
    width: '100%',
    backgroundColor: Colors.warning,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLow: {
    width: '100%',
    backgroundColor: Colors.info,
  },
  tempLow: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  icon: {
    fontSize: 18,
    marginVertical: Spacing.xs,
  },
  dayLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
  },
});
