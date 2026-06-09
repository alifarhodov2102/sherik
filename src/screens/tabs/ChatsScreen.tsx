// src/screens/ChatsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/config';

// NEW: This component fetches the specific user's name for each row
const ChatRow = ({ item, navigation }: { item: any; navigation: any }) => {
  const [otherName, setOtherName] = useState('Roommate');
  const otherUserId = item.participants?.find(
    (id: string) => id !== auth.currentUser?.uid
  );

  useEffect(() => {
    const fetchName = async () => {
      if (!otherUserId) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists() && userDoc.data().name) {
          setOtherName(userDoc.data().name);
        }
      } catch (error) {
        console.error('Error fetching name:', error);
      }
    };
    fetchName();
  }, [otherUserId]);

  return (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={() =>
        navigation.navigate('ChatRoom', {
          chatId: item.id,
          hostId: otherUserId,
        })
      }
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {otherName === 'Roommate' ? '💬' : otherName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{otherName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || 'Start chatting'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatsScreen({ navigation }: any) {
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');

    const q = query(
      chatsRef,
      where('participants', 'array-contains', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setActiveChats(chats);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading chats:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  if (!auth.currentUser) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>
          Log in with a phone number to view your chats.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {activeChats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No active chats yet.</Text>

          <Text style={styles.subText}>
            Find a room and message the owner!
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeChats}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatRow item={item} navigation={navigation} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },

  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 1,
  },

  // Updated to look like the profile circle
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
  },

  chatInfo: {
    flex: 1,
  },

  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },

  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
});