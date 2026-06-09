// src/screens/ListingDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export default function ListingDetailScreen({ route, navigation }: any) {
  const { listing } = route.params;
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

      if (!chatSnap.exists()) {
        navigation.navigate('Paywall', { chatId, hostId });
      } else {
        navigation.navigate('ChatRoom', { chatId, hostId });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Could not start chat.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: listing.imageUrl }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.price}>${listing.price} / month</Text>
          <Text style={styles.district}>{listing.district}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Roommate Preferences</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.roomType || 'Single'} Room</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Prefers: {listing.genderPreference}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description & Rules</Text>
          <Text style={styles.descriptionText}>
            {listing.description || 'No additional description provided.'}
          </Text>
          
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {!isMyListing ? (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
            <Text style={styles.messageButtonText}>Message Roommate</Text>
          </TouchableOpacity>
        </View>
      ) : null}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { width: 60 },
  backText: { fontSize: 16, fontWeight: '600', color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  image: { width: '100%', height: 300, backgroundColor: '#F5F5F5' },
  content: { padding: 24 },
  price: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 4 },
  district: { fontSize: 18, color: '#666', fontWeight: '500', marginBottom: 24 },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  tagsContainer: { flexDirection: 'row', gap: 10 },
  tag: { backgroundColor: '#F5F5F5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { color: '#111', fontWeight: '600', fontSize: 14 },
  descriptionText: { fontSize: 16, color: '#444', lineHeight: 26 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  messageButton: { backgroundColor: '#111', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  messageButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});