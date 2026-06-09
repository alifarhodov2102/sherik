// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';

import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

export default function ProfileScreen({ navigation }: any) {
  // Check if they are actually logged in, or if they hit "Skip"
  const isLoggedIn = !!auth.currentUser;

  const [name, setName] = useState('');
  const [userPhone, setUserPhone] = useState('No phone saved');
  const [occupation, setOccupation] = useState<'Student' | 'Professional' | 'Other'>('Student');
  const [smoker, setSmoker] = useState<'Yes' | 'No'>('No');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // If they aren't logged in, do not try to fetch a database profile!
    if (!auth.currentUser) return;

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
    return () => unsubscribeUser();
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
      await setDoc(userDocRef, { 
        name: name.trim(), occupation, smoker, updatedAt: new Date() 
      }, { merge: true });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      Alert.alert("Error", "Could not save your profile.");
    } finally {
      setIsLoading(false);
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

  const handleLoginPress = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
              <Text style={styles.avatarText}>{name && isLoggedIn ? name.charAt(0).toUpperCase() : '?'}</Text>
            </View>
          </View>

          {/* Conditional Rendering: Only show forms if logged in! */}
          {isLoggedIn ? (
            <>
              <View style={styles.form}>
                <Text style={styles.label}>Verified Phone</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={userPhone} editable={false} />
                <Text style={styles.label}>Display Name</Text>
                <TextInput style={styles.input} placeholder="e.g. Jasur" value={name} onChangeText={setName} />

                <Text style={styles.label}>Occupation</Text>
                <View style={styles.chipContainer}>
                  {['Student', 'Professional', 'Other'].map((option) => (
                    <TouchableOpacity key={option} style={[styles.chip, occupation === option && styles.chipActive]} onPress={() => setOccupation(option as any)}>
                      <Text style={[styles.chipText, occupation === option && styles.chipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Smoker?</Text>
                <View style={styles.chipContainer}>
                  {['No', 'Yes'].map((option) => (
                    <TouchableOpacity key={option} style={[styles.chip, smoker === option && styles.chipActive]} onPress={() => setSmoker(option as any)}>
                      <Text style={[styles.chipText, smoker === option && styles.chipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
                </TouchableOpacity>
                {showSuccess && <Text style={styles.successText}>✓ Profile saved successfully!</Text>}
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyListings')}>
                <Text style={styles.menuItemText}>My Active Rooms</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* What Guest Users See */
            <View style={styles.guestContainer}>
              <Text style={styles.guestTitle}>Welcome to SHERIK</Text>
              <Text style={styles.guestSubtitle}>Log in to save your lifestyle preferences, post rooms, and chat with potential roommates.</Text>
              
              <TouchableOpacity style={styles.loginActionBtn} onPress={handleLoginPress}>
                <Text style={styles.loginActionBtnText}>Log In or Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

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
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#FFF' },
  
  form: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16, color: '#111', marginBottom: 24, letterSpacing: 0, fontWeight: '400' },
  disabledInput: { backgroundColor: '#E0E0E0', color: '#666' },
  chipContainer: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center' },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  saveButton: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  successText: { color: '#4CAF50', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 16 },
  
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 16 },
  menuItemText: { fontSize: 16, fontWeight: '700', color: '#111' },
  menuItemArrow: { fontSize: 24, color: '#CCC', fontWeight: '300' },
  
  logoutButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF3B30', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },

  // Guest State Styles
  guestContainer: { backgroundColor: '#FFF', padding: 32, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 12 },
  guestSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginActionBtn: { backgroundColor: '#111', width: '100%', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  loginActionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});