// src/screens/auth/EditProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function EditProfileScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [userPhone, setUserPhone] = useState('Loading...');
  const [occupation, setOccupation] = useState<'Student' | 'Professional' | 'Other'>('Student');
  const [smoker, setSmoker] = useState<'Yes' | 'No'>('No');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setName(data.name);
          if (data.phoneNumber) setUserPhone(data.phoneNumber);
          if (data.occupation) setOccupation(data.occupation);
          if (data.smoker) setSmoker(data.smoker);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !auth.currentUser) {
      Alert.alert("Hold up", "Please enter a display name first.");
      return;
    }
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { 
        name: name.trim(), occupation, smoker, updatedAt: new Date() 
      }, { merge: true });
      
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#111" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Verified Phone (Cannot be changed)</Text>
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
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { width: 60 },
  backText: { fontSize: 16, fontWeight: '600', color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  
  form: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16, color: '#111', marginBottom: 24, letterSpacing: 0, fontWeight: '400' },
  disabledInput: { backgroundColor: '#E0E0E0', color: '#666' },
  chipContainer: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center' },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  saveButton: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});