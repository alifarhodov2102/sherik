// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, FlatList, ActivityIndicator, Keyboard 
} from 'react-native';
import ListingCard from '../../components/ListingCard';
import { Listing } from '../../types';

// --- FIREBASE IMPORTS ---
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function SearchScreen() {
  const [district, setDistrict] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Any'>('Any');
  
  const [results, setResults] = useState<Listing[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    Keyboard.dismiss(); // Hide keyboard when searching
    setIsLoading(true);
    setHasSearched(true);

    try {
      // 1. Fetch all listings from Firestore
      const querySnapshot = await getDocs(collection(db, 'listings'));
      const allListings: Listing[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allListings.push({
          id: doc.id,
          price: data.price,
          district: data.district,
          genderPreference: data.genderPreference,
          isVerified: data.isVerified || false,
          imageUrl: data.imageUrl,
        } as Listing);
      });

      // 2. Filter the results in JavaScript (Bypasses Firebase Index limits)
      const filtered = allListings.filter((listing) => {
        // Match District (Ignore case and allow partial matches)
        const matchesDistrict = district 
          ? listing.district.toLowerCase().includes(district.trim().toLowerCase()) 
          : true;
        
        // Match Price (Listing price must be less than or equal to maxPrice)
        const matchesPrice = maxPrice 
          ? listing.price <= Number(maxPrice) 
          : true;
        
        // Match Gender (If searching 'Any', show all. Otherwise, match exactly or if listing allows 'Any')
        const matchesGender = gender === 'Any' 
          ? true 
          : (listing.genderPreference === gender || listing.genderPreference === 'Any');

        return matchesDistrict && matchesPrice && matchesGender;
      });

      setResults(filtered);
    } catch (error) {
      console.error("Search error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find a Roommate</Text>
      </View>

      {/* Filter Form */}
      <View style={styles.formContainer}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>District</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Chilonzor" 
              value={district} 
              onChangeText={setDistrict} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Max Price ($)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 300" 
              keyboardType="numeric" 
              value={maxPrice} 
              onChangeText={setMaxPrice} 
            />
          </View>
        </View>

        <Text style={styles.label}>Looking for</Text>
        <View style={styles.chipContainer}>
          {['Any', 'Male', 'Female'].map((option) => (
            <TouchableOpacity 
              key={option}
              style={[styles.chip, gender === option && styles.chipActive]}
              onPress={() => setGender(option as any)}
            >
              <Text style={[styles.chipText, gender === option && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.searchButtonText}>Search Listings</Text>}
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <View style={styles.resultsContainer}>
        {hasSearched && !isLoading && results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rooms found matching your criteria.</Text>
            <Text style={styles.emptyStateSub}>Try adjusting your filters.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  formContainer: { padding: 20, backgroundColor: '#FFF', marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 16, height: 48, fontSize: 16, color: '#111', letterSpacing: 0, fontWeight: '400' },
  chipContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center' },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  searchButton: { backgroundColor: '#111', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resultsContainer: { flex: 1, paddingHorizontal: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: '#666' },
});
