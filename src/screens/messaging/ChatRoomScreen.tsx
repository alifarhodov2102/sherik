// src/screens/ChatRoomScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/config';

export default function ChatRoomScreen({ route, navigation }: any) {
  const chatId = route.params?.chatId;
  const hostId = route.params?.hostId;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');

    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(loadedMessages);
      },
      (error) => {
        console.error('Error loading messages:', error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    if (!auth.currentUser) return;
    if (!chatId) return;

    const textToSend = inputText.trim();

    setInputText('');

    try {
      // Add message
      const messagesRef = collection(
        db,
        'chats',
        chatId,
        'messages'
      );

      await addDoc(messagesRef, {
        text: textToSend,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Update parent chat document
      const chatRef = doc(db, 'chats', chatId);

      await setDoc(
        chatRef,
        {
          lastMessage: textToSend,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isMe =
      item.senderId === auth.currentUser?.uid;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe
            ? styles.myMessage
            : styles.theirMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMe
              ? styles.myMessageText
              : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  if (!chatId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Chat room not found.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backErrorButton}
          >
            <Text style={styles.backErrorText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Chat Room
        </Text>

        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        {/* Messages */}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },

  backButton: {
    padding: 8,
  },

  backText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  messageList: {
    padding: 16,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },

  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#111',
    borderBottomRightRadius: 4,
  },

  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAEAEA',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    letterSpacing: 0,
    fontWeight: '400',
  },

  myMessageText: {
    color: '#FFF',
  },

  theirMessageText: {
    color: '#111',
  },

  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
    letterSpacing: 0,
    fontWeight: '400',
  },

  sendButton: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },

  sendButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  errorText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#111',
  },

  backErrorButton: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  backErrorText: {
    color: '#FFF',
    fontWeight: '700',
  },
});