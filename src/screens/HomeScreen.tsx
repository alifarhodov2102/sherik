// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import ListingCard from '../components/ListingCard';
import { Listing } from '../types';

// Dummy data based on your target market (Tashkent)
const DUMMY_LISTINGS: Listing[] = [
  {
    id: "1",
    price: 250,
    district: "Yunusabad",
    genderPreference: "Male",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    price: 300,
    district: "Mirzo Ulugbek",
    genderPreference: "Female",
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    price: 200,
    district: "Chilonzor",
    genderPreference: "Any",
    isVerified: false,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  }
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.logo}>SHERIK</Text>
        <Text style={styles.subtitle}>Tashkent's Trusted Co-living</Text>
      </View>

      <FlatList
        data={DUMMY_LISTINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  feed: {
    padding: 16,
  },
});