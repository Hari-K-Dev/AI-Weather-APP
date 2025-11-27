import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useChatStore, useWeatherStore } from '@/store';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const { units, setUnits, reset: resetSettings } = useSettingsStore();
  const { clearMessages } = useChatStore();
  const { clearRecentSearches } = useWeatherStore();

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearMessages,
        },
      ]
    );
  };

  const handleClearSearches = () => {
    Alert.alert(
      'Clear Recent Searches',
      'Are you sure you want to clear your search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearRecentSearches,
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Units Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="thermometer-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Temperature</Text>
                <Text style={styles.settingValue}>
                  {units === 'metric' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                </Text>
              </View>
            </View>
            <Switch
              value={units === 'metric'}
              onValueChange={(value) => setUnits(value ? 'metric' : 'imperial')}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="speedometer-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Wind Speed</Text>
                <Text style={styles.settingValue}>
                  {units === 'metric' ? 'km/h' : 'mph'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleClearChat}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubbles-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Clear Chat History</Text>
                <Text style={styles.settingValue}>Delete all messages</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleClearSearches}>
            <View style={styles.settingInfo}>
              <Ionicons name="search-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Clear Search History</Text>
                <Text style={styles.settingValue}>Delete recent searches</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingValue}>1.0.0</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Weather Data</Text>
                <Text style={styles.settingValue}>Open-Meteo</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="hardware-chip-outline" size={22} color={Colors.text} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>AI Model</Text>
                <Text style={styles.settingValue}>Llama 3.2 (Local)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
          <Ionicons name="refresh-outline" size={20} color={Colors.error} />
          <Text style={styles.resetText}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  settingValue: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginTop: 'auto',
  },
  resetText: {
    color: Colors.error,
    fontSize: FontSizes.md,
    marginLeft: Spacing.sm,
  },
});
