// src/screens/tabs/ChatsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator 
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

// Define what a Chat object looks like now
interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
  // NEW: The apartment info we saved from the Paywall!
  listingId?: string;
  district?: string;
  imageUrl?: string;
  price?: number;
}

export default function ChatsScreen({ navigation }: any) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    const myId = auth.currentUser.uid;
    
    // Find all chats where I am one of the participants
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', myId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          participants: data.participants || [],
          lastMessage: data.lastMessage || 'No messages yet',
          updatedAt: data.updatedAt,
          listingId: data.listingId,
          district: data.district,
          imageUrl: data.imageUrl,
          price: data.price,
        } as Chat;
      });

      // Sort chats by newest first
      fetchedChats.sort((a, b) => {
        const dateA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const dateB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return dateB - dateA; 
      });

      setChats(fetchedChats);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // What to show if they haven't logged in yet
  if (!auth.currentUser) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Log in to see messages</Text>
        <Text style={styles.emptySub}>When you message a roommate, your chats will appear here.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>Find a room you love and start a conversation!</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            // Find the ID of the person we are talking to
            const hostId = item.participants.find(id => id !== auth.currentUser?.uid) || '';

            return (
              <TouchableOpacity 
                style={styles.chatRow}
                onPress={() => {
                  // Re-build a mini "listing" object to pass into the ChatRoom
                  const listingData = {
                    id: item.listingId,
                    district: item.district,
                    imageUrl: item.imageUrl,
                    price: item.price
                  };
                  navigation.navigate('ChatRoom', { 
                    chatId: item.id, 
                    hostId: hostId,
                    listing: listingData // Pass it forward!
                  });
                }}
              >
                {/* Display the Room Image instead of an Avatar */}
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.roomImage} />
                ) : (
                  <View style={[styles.roomImage, { backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>🏠</Text>
                  </View>
                )}

                <View style={styles.chatInfo}>
                  <View style={styles.topTextRow}>
                    <Text style={styles.districtText} numberOfLines={1}>
                      {item.district || 'Room'}
                    </Text>
                    {item.price && (
                      <Text style={styles.priceText}>${item.price}</Text>
                    )}
                  </View>
                  <Text style={styles.lastMessageText} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 24 },
  
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111' },
  
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8 },
  emptySub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },

  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  
  // Make the image a nice rounded square
  roomImage: { width: 64, height: 64, borderRadius: 12, marginRight: 16 },
  
  chatInfo: { flex: 1, justifyContent: 'center' },
  topTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  
  districtText: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1, marginRight: 8 },
  priceText: { fontSize: 14, fontWeight: '600', color: '#2E7D32' },
  
  lastMessageText: { fontSize: 15, color: '#666' },
});