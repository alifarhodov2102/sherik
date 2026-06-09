// src/components/ListingCard.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Listing } from '../types';
import { auth, db } from '../firebase/config';

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const navigation = useNavigation<any>();

  const isMyListing = auth.currentUser?.uid === listing.userId;

  const handleMessagePress = async () => {
    if (!auth.currentUser) {
      Alert.alert('Hold up', 'You need to log in with a phone number to message users.');
      return;
    }

    try {
      const myId = auth.currentUser.uid;
      const hostId = listing.userId;

      if (!hostId) {
        Alert.alert("Oops!", "This is an old test listing. Please try a newer listing!");
        return;
      }

      const chatId = [myId, hostId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      // Do NOT create the chat here. Just check if it exists.
      if (!chatSnap.exists()) {
        // No chat exists? Send them to the Paywall.
        navigation.navigate('Paywall', { chatId, hostId });
      } else {
        // Chat exists? They already paid. Send to ChatRoom.
        navigation.navigate('ChatRoom', { chatId, hostId });
      }

    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Could not start chat.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Tapping anywhere on the top part of the card goes to Details */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate('ListingDetail', { listing })}
      >
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

          <Text style={styles.price}>
            ${listing.price} / month
          </Text>

          {/* Displays Single/Shared + Gender Preference cleanly */}
          <Text style={styles.details}>
            {listing.roomType || 'Single'} Room • Prefers: {listing.genderPreference}
          </Text>
        </View>
      </TouchableOpacity>

      {/* The Message Button stays safely at the bottom of the card */}
      {!isMyListing && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessagePress}
          >
            <Text style={styles.messageButtonText}>
              Message Roommate
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
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

  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },

  messageButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },

  messageButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});