import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, getAQIColor } from '@/constants/theme';

interface AQIBadgeProps {
  aqi: number;
  category: string;
}

export function AQIBadge({ aqi, category }: AQIBadgeProps) {
  const color = getAQIColor(aqi);

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Text style={styles.label}>AQI</Text>
        <Text style={[styles.value, { color }]}>{aqi}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  indicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  content: {
    alignItems: 'flex-start',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  category: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
  },
});
