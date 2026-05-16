// src/screens/PostScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function PostScreen() {
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Any'>('Any');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Listing</Text>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          
          {/* Photos Placeholder */}
          <TouchableOpacity style={styles.photoUpload}>
            <Text style={styles.photoUploadText}>+ Add Photos</Text>
          </TouchableOpacity>

          {/* District */}
          <Text style={styles.label}>District in Tashkent</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Yunusabad, Chilonzor"
            value={district}
            onChangeText={setDistrict}
            placeholderTextColor="#A0A0A0"
          />

          {/* Price */}
          <Text style={styles.label}>Monthly Price (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 250"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholderTextColor="#A0A0A0"
          />

          {/* Gender Preference */}
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

          {/* Description */}
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

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Publish Listing</Text>
          </TouchableOpacity>
          
          {/* Extra space at the bottom for scrolling past the keyboard */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  form: {
    padding: 20,
  },
  photoUpload: {
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  photoUploadText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
    marginBottom: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#111',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#111',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});