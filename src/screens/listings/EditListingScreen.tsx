// src/screens/listings/EditListingScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function EditListingScreen({ route, navigation }: any) {
  const { listing } = route.params;

  // Pre-fill the form with the existing listing data
  const [price, setPrice] = useState(listing.price.toString());
  const [district, setDistrict] = useState(listing.district);
  const [description, setDescription] = useState(listing.description || '');
  const [roomType, setRoomType] = useState<'Single' | 'Shared'>(listing.roomType || 'Single');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Any'>(listing.genderPreference || 'Any');
  
  // NEW: Location Link State (pre-filled if they already have one)
  const [locationLink, setLocationLink] = useState(listing.locationLink || '');
  
  const [isLoading, setIsLoading] = useState(false);

  // NEW: Security Check for Map Links
  const isValidMapLink = (url: string) => {
    if (!url.trim()) return true; // Optional field
    const mapRegex = /(google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|yandex\.[a-z]{2,3}\/maps|yandex\.com|2gis\.uz|go\.2gis\.com)/i;
    return mapRegex.test(url);
  };

  const handleUpdate = async () => {
    if (!district || !price || !description) {
      Alert.alert("Missing Info", "Please fill out the district, price, and description.");
      return;
    }

    // NEW: Link Validation
    if (!isValidMapLink(locationLink)) {
      Alert.alert("Invalid Link", "Please provide a valid Google Maps, Yandex, or 2GIS link.");
      return;
    }

    setIsLoading(true);
    try {
      const listingRef = doc(db, 'listings', listing.id);
      await updateDoc(listingRef, {
        district: district.trim(),
        price: Number(price),
        roomType: roomType,
        genderPreference: gender,
        description: description.trim(),
        locationLink: locationLink.trim(), // <-- NEW: Updates the link in the database
      });
      
      Alert.alert("Success!", "Your room has been updated.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating document: ", error);
      Alert.alert("Error", "Could not update your listing. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>District in Tashkent</Text>
          <TextInput style={styles.input} value={district} onChangeText={setDistrict} />

          <Text style={styles.label}>Monthly Price (USD)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />

          <Text style={styles.label}>Room Type</Text>
          <View style={styles.chipContainer}>
            {['Single', 'Shared'].map((option) => (
              <TouchableOpacity key={option} style={[styles.chip, roomType === option && styles.chipActive]} onPress={() => setRoomType(option as any)}>
                <Text style={[styles.chipText, roomType === option && styles.chipTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Roommate Preference</Text>
          <View style={styles.chipContainer}>
            {['Any', 'Male', 'Female'].map((option) => (
              <TouchableOpacity key={option} style={[styles.chip, gender === option && styles.chipActive]} onPress={() => setGender(option as any)}>
                <Text style={[styles.chipText, gender === option && styles.chipTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description & Rules</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={description} onChangeText={setDescription} />

          {/* NEW: Map Link Input */}
          <Text style={styles.label}>Location Map Link (Optional)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Paste Google Maps, Yandex, or 2GIS link" 
            value={locationLink} 
            onChangeText={setLocationLink} 
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Save Changes</Text>}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { width: 60 },
  backText: { fontSize: 16, fontWeight: '600', color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111', marginBottom: 24, letterSpacing: 0, fontWeight: '400' },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center' },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  submitButton: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});