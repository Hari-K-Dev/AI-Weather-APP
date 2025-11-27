import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

interface WeatherCardProps {
  icon: string;
  label: string;
  value: string;
}

export function WeatherCard({ icon, label, value }: WeatherCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  icon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  value: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
});
