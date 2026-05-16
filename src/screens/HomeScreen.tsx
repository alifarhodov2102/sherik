// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import ListingCard from '../components/ListingCard';
import { Listing } from '../types';

// --- FIREBASE IMPORTS ---
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function HomeScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Create a query to get listings from newest to oldest
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));

    // 2. Listen for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveListings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          price: data.price,
          district: data.district,
          genderPreference: data.genderPreference,
          isVerified: data.isVerified || false,
          imageUrl: data.imageUrl,
        } as Listing;
      });

      setListings(liveListings);
      setIsLoading(false);
    });

    // 3. Cleanup the listener when we leave the screen
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.logo}>SHERIK</Text>
        <Text style={styles.subtitle}>Tashkent's Trusted Co-living</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No listings yet. Be the first to post!</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ListingCard listing={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  header: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 24, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EAEAEA" },
  logo: { fontSize: 24, fontWeight: "800", color: "#111111", letterSpacing: 1 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  feed: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' }
});