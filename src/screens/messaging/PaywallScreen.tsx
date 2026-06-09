// src/screens/messaging/PaywallScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert
} from 'react-native';

import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function PaywallScreen({ route, navigation }: any) {
  // NEW: We are now receiving the 'listing' data from the card!
  const { chatId, hostId, listing } = route.params; 
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalPayment = () => {
    setIsProcessing(true);
    
    setTimeout(async () => {
      try {
        const myId = auth.currentUser?.uid;
        if (!myId) throw new Error("No user ID");

        const chatRef = doc(db, 'chats', chatId);
        await setDoc(chatRef, {
          participants: [myId, hostId],
          lastMessage: 'Chat unlocked!',
          updatedAt: new Date(),
          // NEW: Save the apartment info permanently into this chat room!
          listingId: listing?.id || '',
          district: listing?.district || 'Unknown District',
          imageUrl: listing?.imageUrl || '',
          price: listing?.price || 0,
        });

        setIsProcessing(false);
        setIsModalVisible(false);
        
        // Pass the listing data to the chat room too!
        navigation.replace('ChatRoom', { chatId, hostId, listing });

      } catch (error) {
        console.error("Error creating chat:", error);
        Alert.alert("Error", "Could not unlock chat. Please contact support.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔒</Text>
        </View>

        <Text style={styles.title}>Unlock Chat</Text>
        <Text style={styles.subtitle}>
          Connect instantly to secure the room in {listing?.district || 'this district'}.
        </Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>One-time connection fee</Text>
          <Text style={styles.priceAmount}>1,000 UZS</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.payButtonText}>Pay to Unlock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => !isProcessing && setIsModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Transfer</Text>
              {!isProcessing && (
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.instructions}>
              1. Copy the card number below.{"\n"}
              2. Transfer exactly 1,000 UZS via Payme or Click.{"\n"}
              3. Press "I Have Paid" to unlock the chat.
            </Text>

            <View style={styles.cardDesign}>
              <Text style={styles.cardLogo}>UZCARD</Text>
              <View style={styles.cardChip} />
              
              <Text style={styles.cardLabel}>Card Number (Long press to copy)</Text>
              <Text style={styles.cardNumberText} selectable={true}>8600 1234 5678 9012</Text>

              <View style={styles.cardRow}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>Card Holder</Text>
                  <Text style={styles.cardHolderText}>ALI FARHODOV</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]} onPress={handleFinalPayment} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>I Have Paid</Text>}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  iconText: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 20 },
  priceCard: { width: '100%', backgroundColor: '#F8F9FA', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', alignItems: 'center' },
  priceLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  priceAmount: { fontSize: 32, fontWeight: '800', color: '#111' },
  footer: { padding: 24, paddingBottom: 40 },
  payButton: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  payButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  closeText: { fontSize: 16, color: '#FF3B30', fontWeight: '600' },
  instructions: { fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 24 },
  cardDesign: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cardLogo: { color: '#FFF', fontSize: 18, fontWeight: '900', fontStyle: 'italic', marginBottom: 16 },
  cardChip: { width: 40, height: 30, backgroundColor: '#FFD700', borderRadius: 6, marginBottom: 20, opacity: 0.8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardCol: { flex: 1, marginRight: 16 },
  cardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  cardNumberText: { color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: 2, marginBottom: 20 },
  cardHolderText: { color: '#FFF', fontSize: 16, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  confirmButton: { backgroundColor: '#00C853', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmButtonDisabled: { backgroundColor: '#A5D6A7' },
  confirmButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});