// src/screens/listings/UnlockedRoomsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function UnlockedRoomsScreen({ navigation }: any) {
  const [unlockedRooms, setUnlockedRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;

    // 1. Find all chats where the user is a participant
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', myId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // 2. Filter out rooms where the user is the host (we only want rooms they BOUGHT)
        // If myId is not the first person in the array, or if we want to be safe, 
        // we just ensure the listing actually exists in the chat data
        if (data.listingId) {
          rooms.push({
            chatId: doc.id,
            listingId: data.listingId,
            district: data.district,
            imageUrl: data.imageUrl,
            price: data.price,
            updatedAt: data.updatedAt
          });
        }
      });

      // Sort by newest unlocks first
      rooms.sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis());
      setUnlockedRooms(rooms);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // When they tap a card, we fetch the FULL listing from the database and open the Details page
  const handleOpenRoom = async (listingId: string) => {
    setIsOpening(true);
    try {
      const listingSnap = await getDoc(doc(db, 'listings', listingId));
      
      if (listingSnap.exists()) {
        const fullListing = { id: listingSnap.id, ...listingSnap.data() };
        navigation.navigate('ListingDetail', { listing: fullListing });
      } else {
        Alert.alert("Unavailable", "The host has deleted this listing.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not load the room details.");
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#111" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlocked Rooms</Text>
        <View style={{ width: 60 }} />
      </View>

      {unlockedRooms.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You haven't unlocked any rooms yet.</Text>
        </View>
      ) : (
        <FlatList
          data={unlockedRooms}
          keyExtractor={(item) => item.chatId}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => handleOpenRoom(item.listingId)}
              disabled={isOpening}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.district}>{item.district || 'Room'}</Text>
                {item.price && <Text style={styles.price}>${item.price} / mo</Text>}
                <Text style={styles.linkText}>View full details ›</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { width: 60 },
  backText: { fontSize: 16, fontWeight: '600', color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  emptyText: { color: '#666', fontSize: 16, fontWeight: '500' },
  
  card: { backgroundColor: '#FFF', flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 16, backgroundColor: '#EAEAEA' },
  info: { flex: 1, justifyContent: 'center' },
  district: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '600', color: '#2E7D32', marginBottom: 8 },
  linkText: { fontSize: 14, fontWeight: '600', color: '#007AFF' }
});