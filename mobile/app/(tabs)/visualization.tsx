import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { useWeather } from '@/hooks';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - Spacing.md * 2;
const CHART_HEIGHT = 200;
const PADDING = 40;

type ChartType = 'temperature' | 'precipitation';

export default function VisualizationScreen() {
  const { weather, isLoading } = useWeather();
  const [chartType, setChartType] = useState<ChartType>('temperature');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (isLoading || !weather) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dailyData = weather.daily;

  // Temperature chart data
  const temps = dailyData.map((d) => ({
    high: d.temp_max,
    low: d.temp_min,
    date: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
  }));

  const allTemps = temps.flatMap((t) => [t.high, t.low]);
  const minTemp = Math.min(...allTemps) - 5;
  const maxTemp = Math.max(...allTemps) + 5;

  // Precipitation chart data
  const precips = dailyData.map((d) => ({
    prob: d.precipitation_probability,
    date: new Date(d.date).toLocaleDateString([], { weekday: 'short' }),
  }));

  const chartWidth = CHART_WIDTH - PADDING * 2;
  const chartHeight = CHART_HEIGHT - PADDING * 2;
  const stepX = chartWidth / (dailyData.length - 1);

  // Scale functions
  const scaleY = (value: number) => {
    const range = maxTemp - minTemp;
    return PADDING + chartHeight - ((value - minTemp) / range) * chartHeight;
  };

  const scalePrecipY = (value: number) => {
    return PADDING + chartHeight - (value / 100) * chartHeight;
  };

  // Generate path for temperature line
  const generatePath = (data: number[]) => {
    return data
      .map((val, i) => {
        const x = PADDING + i * stepX;
        const y = scaleY(val);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const highPath = generatePath(temps.map((t) => t.high));
  const lowPath = generatePath(temps.map((t) => t.low));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Chart Type Selector */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              chartType === 'temperature' && styles.selectorButtonActive,
            ]}
            onPress={() => setChartType('temperature')}
          >
            <Text
              style={[
                styles.selectorText,
                chartType === 'temperature' && styles.selectorTextActive,
              ]}
            >
              Temperature
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              chartType === 'precipitation' && styles.selectorButtonActive,
            ]}
            onPress={() => setChartType('precipitation')}
          >
            <Text
              style={[
                styles.selectorText,
                chartType === 'precipitation' && styles.selectorTextActive,
              ]}
            >
              Precipitation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {chartType === 'temperature'
              ? '7-Day Temperature Forecast'
              : '7-Day Precipitation Probability'}
          </Text>

          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <Line
                key={i}
                x1={PADDING}
                y1={PADDING + chartHeight * ratio}
                x2={CHART_WIDTH - PADDING}
                y2={PADDING + chartHeight * ratio}
                stroke={Colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            ))}

            {chartType === 'temperature' ? (
              <>
                {/* High temperature line */}
                <Path
                  d={highPath}
                  stroke={Colors.warning}
                  strokeWidth={3}
                  fill="none"
                />
                {/* Low temperature line */}
                <Path
                  d={lowPath}
                  stroke={Colors.info}
                  strokeWidth={3}
                  fill="none"
                />

                {/* Data points - High */}
                {temps.map((t, i) => (
                  <Circle
                    key={`high-${i}`}
                    cx={PADDING + i * stepX}
                    cy={scaleY(t.high)}
                    r={selectedIndex === i ? 8 : 5}
                    fill={Colors.warning}
                    onPress={() => setSelectedIndex(i)}
                  />
                ))}

                {/* Data points - Low */}
                {temps.map((t, i) => (
                  <Circle
                    key={`low-${i}`}
                    cx={PADDING + i * stepX}
                    cy={scaleY(t.low)}
                    r={selectedIndex === i ? 8 : 5}
                    fill={Colors.info}
                    onPress={() => setSelectedIndex(i)}
                  />
                ))}

                {/* Y-axis labels */}
                <SvgText
                  x={PADDING - 5}
                  y={PADDING + 5}
                  fill={Colors.textSecondary}
                  fontSize={10}
                  textAnchor="end"
                >
                  {Math.round(maxTemp)}°
                </SvgText>
                <SvgText
                  x={PADDING - 5}
                  y={PADDING + chartHeight + 5}
                  fill={Colors.textSecondary}
                  fontSize={10}
                  textAnchor="end"
                >
                  {Math.round(minTemp)}°
                </SvgText>
              </>
            ) : (
              <>
                {/* Precipitation bars */}
                {precips.map((p, i) => (
                  <Rect
                    key={i}
                    x={PADDING + i * stepX - 15}
                    y={scalePrecipY(p.prob)}
                    width={30}
                    height={PADDING + chartHeight - scalePrecipY(p.prob)}
                    fill={Colors.rainy}
                    opacity={selectedIndex === i ? 1 : 0.7}
                    rx={4}
                    onPress={() => setSelectedIndex(i)}
                  />
                ))}

                {/* Y-axis labels */}
                <SvgText
                  x={PADDING - 5}
                  y={PADDING + 5}
                  fill={Colors.textSecondary}
                  fontSize={10}
                  textAnchor="end"
                >
                  100%
                </SvgText>
                <SvgText
                  x={PADDING - 5}
                  y={PADDING + chartHeight + 5}
                  fill={Colors.textSecondary}
                  fontSize={10}
                  textAnchor="end"
                >
                  0%
                </SvgText>
              </>
            )}

            {/* X-axis labels */}
            {temps.map((t, i) => (
              <SvgText
                key={i}
                x={PADDING + i * stepX}
                y={CHART_HEIGHT - 5}
                fill={Colors.textSecondary}
                fontSize={10}
                textAnchor="middle"
              >
                {t.date}
              </SvgText>
            ))}
          </Svg>

          {/* Legend */}
          {chartType === 'temperature' && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.legendText}>High</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
                <Text style={styles.legendText}>Low</Text>
              </View>
            </View>
          )}
        </View>

        {/* Selected Day Details */}
        {selectedIndex !== null && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>
              {dailyData[selectedIndex].date}
            </Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>High:</Text>
              <Text style={styles.detailsValue}>
                {Math.round(dailyData[selectedIndex].temp_max)}°
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Low:</Text>
              <Text style={styles.detailsValue}>
                {Math.round(dailyData[selectedIndex].temp_min)}°
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Rain chance:</Text>
              <Text style={styles.detailsValue}>
                {dailyData[selectedIndex].precipitation_probability}%
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Conditions:</Text>
              <Text style={styles.detailsValue}>
                {dailyData[selectedIndex].description}
              </Text>
            </View>
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            Tap on data points to see detailed information
          </Text>
        </View>
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
  content: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: Colors.primary,
  },
  selectorText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  selectorTextActive: {
    color: Colors.text,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailsTitle: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailsLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  detailsValue: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  tipContainer: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  tipText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
});
