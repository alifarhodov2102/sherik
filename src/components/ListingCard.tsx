// src/components/ListingCard.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Listing } from '../types';

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: listing.imageUrl }} 
        style={styles.image} 
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.district}>{listing.district}</Text>
          {listing.isVerified && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Verified</Text>
            </View>
          )}
        </View>

        <Text style={styles.price}>${listing.price} / month</Text>
        <Text style={styles.gender}>Preference: {listing.genderPreference}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  district: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  gender: {
    fontSize: 14,
    color: '#666',
  },
});