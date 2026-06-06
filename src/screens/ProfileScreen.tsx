// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { doc, setDoc, collection, query, where, deleteDoc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';

export default function ProfileScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [userPhone, setUserPhone] = useState('No phone saved');
  
  // NEW: Lifestyle States linked to Onboarding
  const [occupation, setOccupation] = useState<'Student' | 'Professional' | 'Other'>('Student');
  const [smoker, setSmoker] = useState<'Yes' | 'No'>('No');

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // 1. Fetch Profile Name, Phone & Lifestyle Data
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) setName(data.name);
        if (data.phoneNumber) setUserPhone(data.phoneNumber);
        if (data.occupation) setOccupation(data.occupation);
        if (data.smoker) setSmoker(data.smoker);
      }
    });

    // 2. Fetch User's Active Listings
    const q = query(collection(db, 'listings'), where('userId', '==', auth.currentUser.uid));
    const unsubscribeListings = onSnapshot(q, (snapshot) => {
      const listings: any[] = [];
      snapshot.forEach((doc) => {
        listings.push({ id: doc.id, ...doc.data() });
      });
      setMyListings(listings);
    });

    return () => {
      unsubscribeUser();
      unsubscribeListings();
    };
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !auth.currentUser) {
      Alert.alert("Hold up", "Please enter a display name first.");
      return;
    }
    
    setIsLoading(true);
    setShowSuccess(false);

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      // Save all updated profile info
      await setDoc(userDocRef, { 
        name: name.trim(), 
        occupation: occupation,
        smoker: smoker,
        updatedAt: new Date() 
      }, { merge: true });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    const executeDelete = async () => {
      try {
        await deleteDoc(doc(db, 'listings', listingId));
      } catch (error) {
        console.error(error);
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

  const handleLogout = async () => {
    const executeSignOut = async () => {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to log out?")) await executeSignOut();
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: executeSignOut }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Verified Phone</Text>
            <TextInput 
              style={[styles.input, styles.disabledInput]} 
              value={userPhone} 
              editable={false} 
            />

            <Text style={styles.label}>Display Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Jasur" value={name} onChangeText={setName} />

            {/* Editable Occupation */}
            <Text style={styles.label}>Occupation</Text>
            <View style={styles.chipContainer}>
              {['Student', 'Professional', 'Other'].map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[styles.chip, occupation === option && styles.chipActive]}
                  onPress={() => setOccupation(option as any)}
                >
                  <Text style={[styles.chipText, occupation === option && styles.chipTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Editable Smoker Status */}
            <Text style={styles.label}>Smoker?</Text>
            <View style={styles.chipContainer}>
              {['No', 'Yes'].map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[styles.chip, smoker === option && styles.chipActive]}
                  onPress={() => setSmoker(option as any)}
                >
                  <Text style={[styles.chipText, smoker === option && styles.chipTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
            </TouchableOpacity>
            {showSuccess && <Text style={styles.successText}>✓ Profile saved successfully!</Text>}
          </View>

          <View style={styles.listingsSection}>
            <Text style={styles.sectionTitle}>My Active Rooms</Text>
            
            {myListings.length === 0 ? (
              <Text style={styles.emptyText}>You haven't posted any rooms yet.</Text>
            ) : (
              myListings.map((listing) => (
                <View key={listing.id} style={styles.listingCard}>
                  <Image source={{ uri: listing.imageUrl }} style={styles.listingImage} />
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingPrice}>${listing.price} / mo</Text>
                    <Text style={styles.listingDistrict}>{listing.district}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteListing(listing.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  content: { flex: 1, padding: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#FFF' },
  form: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16, color: '#111', marginBottom: 24 },
  disabledInput: { backgroundColor: '#E0E0E0', color: '#666' },
  
  // Chip Styles
  chipContainer: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center' },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },

  saveButton: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  successText: { color: '#4CAF50', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 16 },
  listingsSection: { marginTop: 40, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  emptyText: { color: '#666', fontSize: 14, fontStyle: 'italic' },
  listingCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  listingImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  listingInfo: { flex: 1 },
  listingPrice: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  listingDistrict: { fontSize: 14, color: '#666' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF0F0', borderRadius: 8 },
  deleteText: { color: '#FF3B30', fontWeight: '600', fontSize: 14 },
  logoutButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF3B30', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  logoutButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
});