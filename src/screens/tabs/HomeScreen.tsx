// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import ListingCard from '../../components/ListingCard';
import { Listing } from '../../types';

// --- FIREBASE IMPORTS ---
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function HomeScreen({ navigation }: any) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userInitial, setUserInitial] = useState('?');

  useEffect(() => {
    // 1. Fetch Listings
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const unsubscribeListings = onSnapshot(q, (snapshot) => {
      const liveListings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          price: data.price,
          district: data.district,
          genderPreference: data.genderPreference,
          isVerified: data.isVerified || false,
          imageUrl: data.imageUrl,
          userId: data.userId,
          roomType: data.roomType || 'Single',
          description: data.description || '',
        } as Listing;
      });
      setListings(liveListings);
      setIsLoading(false);
    });

    // 2. Fetch Profile Name for the Avatar Circle
    let unsubscribeUser = () => {};
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().name) {
          setUserInitial(docSnap.data().name.charAt(0).toUpperCase());
        } else {
          setUserInitial('?');
        }
      });
    }

    return () => {
      unsubscribeListings();
      unsubscribeUser();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleProfileCirclePress = async () => {
    if (!auth.currentUser) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>SHERIK</Text>
          <Text style={styles.subtitle}>Tashkent's Trusted Co-living</Text>
        </View>
        
        <TouchableOpacity style={styles.profileCircle} onPress={handleProfileCirclePress}>
          <Text style={styles.profileCircleText}>{userInitial}</Text>
        </TouchableOpacity>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 20, paddingHorizontal: 24, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EAEAEA" },
  logo: { fontSize: 24, fontWeight: "800", color: "#111111", letterSpacing: 1 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  profileCircleText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  feed: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' }
});