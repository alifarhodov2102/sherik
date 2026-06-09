// src/screens/tabs/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  SafeAreaView, Alert, Platform, ScrollView
} from 'react-native';

import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

export default function ProfileScreen({ navigation }: any) {
  const isLoggedIn = !!auth.currentUser;

  const [name, setName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [occupation, setOccupation] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) setName(data.name);
        if (data.phoneNumber) setUserPhone(data.phoneNumber);
        if (data.occupation) setOccupation(data.occupation);
      }
    });
    return () => unsubscribeUser();
  }, []);

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {isLoggedIn ? (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
              </View>
              <Text style={styles.nameText}>{name || 'Welcome!'}</Text>
              <Text style={styles.phoneText}>{userPhone}</Text>
              {occupation ? <Text style={styles.occupationText}>{occupation}</Text> : null}
            </View>

            <View style={styles.menuContainer}>
              {/* NEW: Edit Profile Button */}
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.menuItemText}>Edit Profile Info</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyListings')}>
                <Text style={styles.menuItemText}>My Active Rooms</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UnlockedRooms')}>
                <Text style={styles.menuItemText}>My Unlocked Rooms</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  content: { flex: 1, padding: 24 },
  
  profileHeader: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#FFF' },
  nameText: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  phoneText: { fontSize: 16, color: '#666', fontWeight: '500', marginBottom: 4 },
  occupationText: { fontSize: 14, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  
  menuContainer: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuItemText: { fontSize: 16, fontWeight: '700', color: '#111' },
  menuItemArrow: { fontSize: 24, color: '#CCC', fontWeight: '300' },
  
  logoutButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF3B30', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },

  guestContainer: { backgroundColor: '#FFF', padding: 32, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginTop: 40 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 12 },
  guestSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginActionBtn: { backgroundColor: '#111', width: '100%', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  loginActionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});