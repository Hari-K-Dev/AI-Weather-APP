import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGeocode } from '@/hooks';
import { useWeatherStore } from '@/store';
import { GeoLocation, SavedLocation } from '@/types';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { results, isLoading } = useGeocode(query);
  const {
    recentSearches,
    savedLocations,
    setCurrentLocation,
    addRecentSearch,
    addSavedLocation,
  } = useWeatherStore();

  const handleSelectLocation = useCallback(
    (location: GeoLocation) => {
      const savedLocation: SavedLocation = {
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country,
        state: location.state,
      };

      setCurrentLocation(savedLocation);
      addRecentSearch(location.name);
      addSavedLocation(savedLocation);
      setQuery('');
      router.push('/');
    },
    [setCurrentLocation, addRecentSearch, addSavedLocation, router]
  );

  const handleSelectSaved = useCallback(
    (location: SavedLocation) => {
      setCurrentLocation(location);
      router.push('/');
    },
    [setCurrentLocation, router]
  );

  const renderSearchResult = ({ item }: { item: GeoLocation }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectLocation(item)}
    >
      <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
      <View style={styles.resultText}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultLocation}>
          {[item.state, item.country].filter(Boolean).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSavedLocation = ({ item }: { item: SavedLocation }) => (
    <TouchableOpacity
      style={styles.savedItem}
      onPress={() => handleSelectSaved(item)}
    >
      <Ionicons name="bookmark" size={18} color={Colors.primary} />
      <Text style={styles.savedName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cities..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      {/* Search Results */}
      {query.length >= 2 && results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* No Results */}
      {query.length >= 2 && !isLoading && results.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No cities found</Text>
        </View>
      )}

      {/* Saved Locations */}
      {query.length < 2 && savedLocations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Locations</Text>
          <FlatList
            data={savedLocations}
            renderItem={renderSavedLocation}
            keyExtractor={(item) => `${item.lat}-${item.lon}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.savedList}
          />
        </View>
      )}

      {/* Recent Searches */}
      {query.length < 2 && recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {recentSearches.slice(0, 5).map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => setQuery(search)}
            >
              <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {query.length < 2 &&
        savedLocations.length === 0 &&
        recentSearches.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              Search for a city to get started
            </Text>
          </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSizes.md,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  resultName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  resultLocation: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  savedList: {
    paddingVertical: Spacing.sm,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  savedName: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    marginLeft: Spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  recentText: {
    color: Colors.text,
    fontSize: FontSizes.md,
    marginLeft: Spacing.sm,
  },
  noResults: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
  },
});
