// src/screens/ChatRoomScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, FlatList, KeyboardAvoidingView, Platform 
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export default function ChatRoomScreen({ route, navigation }: any) {
  // In a real app, we pass the chatId from the previous screen. 
  // For testing, we'll use a hardcoded 'test_chat' if none is provided.
  const chatId = route.params?.chatId || 'test_chat';
  const chatName = route.params?.name || 'Roommate';

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  // 1. Listen for real-time messages
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(liveMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  // 2. Send a message
  const sendMessage = async () => {
    if (inputText.trim() === '' || !auth.currentUser) return;

    const textToSend = inputText.trim();
    setInputText(''); // Clear input instantly for good UX

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // 3. Render each message bubble
  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === auth.currentUser?.uid;

    return (
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <View style={{ width: 50 }} /> {/* Spacer to center title */}
        </View>

        {/* Messages List */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          // Optional: automatically scroll to bottom, though works best with inverted lists in complex apps
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#A0A0A0"
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  keyboardAvoid: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#111', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  messageList: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#111', borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#EAEAEA', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  myText: { color: '#FFF' },
  theirText: { color: '#111' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EAEAEA', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendButton: { marginLeft: 12, backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendButtonDisabled: { backgroundColor: '#A0A0A0' },
  sendButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});