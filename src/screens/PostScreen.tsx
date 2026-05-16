// src/screens/PostScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export default function PostScreen({ navigation }: any) {
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    // 1. Basic validation
    if (!district || !price || !description) {
      Alert.alert("Missing Info", "Please fill out the district, price, and description.");
      return;
    }

    // 2. Ensure user is actually logged in
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to post a listing.");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Save the listing to Firestore 'listings' collection
      await addDoc(collection(db, 'listings'), {
        userId: auth.currentUser.uid, // Connects the post to the logged-in user
        district: district.trim(),
        price: Number(price),
        genderPreference: gender,
        description: description.trim(),
        // We use a clean, placeholder image for now to keep development moving fast
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        isVerified: false, // Default to unverified as per your Trust & Safety spec V1
        createdAt: serverTimestamp(),
      });

      // 4. Success! Clear the form and go back to Home
      Alert.alert("Success!", "Your room has been published.");
      setDistrict('');
      setPrice('');
      setDescription('');
      setGender('Any');
      
      // Navigate back to the Home tab
      navigation.navigate('Home');

    } catch (error: any) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Could not publish your listing. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Listing</Text>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.photoUpload}>
            <Text style={styles.photoUploadText}>+ Add Photos (Coming Soon)</Text>
          </TouchableOpacity>

          <Text style={styles.label}>District in Tashkent</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Yunusabad, Chilonzor"
            value={district}
            onChangeText={setDistrict}
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.label}>Monthly Price (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 250"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.label}>Roommate Preference</Text>
          <View style={styles.chipContainer}>
            {['Any', 'Male', 'Female'].map((option) => (
              <TouchableOpacity 
                key={option}
                style={[styles.chip, gender === option && styles.chipActive]}
                onPress={() => setGender(option as any)}
              >
                <Text style={[styles.chipText, gender === option && styles.chipTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description & Rules</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the apartment and any rules (e.g., no smoking)..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#A0A0A0"
          />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handlePublish}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Publish Listing</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#EAEAEA', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  form: { padding: 20 },
  photoUpload: { height: 120, backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  photoUploadText: { color: '#666', fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111', marginBottom: 24 },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center' },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  submitButton: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});