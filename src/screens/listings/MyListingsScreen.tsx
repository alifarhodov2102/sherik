// src/screens/MyListingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { Listing } from '../../types';

export default function MyListingsScreen({ navigation }: any) {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'listings'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setMyListings(listings);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (listingId: string) => {
    const executeDelete = async () => {
      try {
        await deleteDoc(doc(db, 'listings', listingId));
      } catch (error) {
        Alert.alert("Error", "Could not delete the listing.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Remove this room from the marketplace?")) await executeDelete();
    } else {
      Alert.alert("Delete Listing", "Remove this room from the marketplace?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: executeDelete }
      ]);
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
        <Text style={styles.headerTitle}>My Active Rooms</Text>
        <View style={{ width: 60 }} />
      </View>

      {myListings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You haven't posted any rooms yet.</Text>
        </View>
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.price}>${item.price} / mo</Text>
                  <Text style={styles.district}>{item.district}</Text>
                  <Text style={styles.type}>{item.roomType || 'Single'} Room</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => navigation.navigate('EditListing', { listing: item })}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', marginBottom: 16 },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  info: { flex: 1, justifyContent: 'center' },
  price: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4 },
  district: { fontSize: 16, color: '#666', marginBottom: 4 },
  type: { fontSize: 14, color: '#888' },
  actionRow: { flexDirection: 'row', gap: 12 },
  editButton: { flex: 1, backgroundColor: '#F5F5F5', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  editButtonText: { color: '#111', fontWeight: '700', fontSize: 14 },
  deleteButton: { flex: 1, backgroundColor: '#FFF0F0', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  deleteButtonText: { color: '#FF3B30', fontWeight: '700', fontSize: 14 },
});