// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Switch
} from 'react-native';

export default function SearchScreen() {
  const [district, setDistrict] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search & Filter</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* District Filter */}
        <Text style={styles.label}>District</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Yunusabad, Mirzo Ulugbek"
          value={district}
          onChangeText={setDistrict}
          placeholderTextColor="#A0A0A0"
        />

        {/* Budget Filter */}
        <Text style={styles.label}>Maximum Monthly Price (USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 300"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholderTextColor="#A0A0A0"
        />

        {/* Gender Preference Filter */}
        <Text style={styles.label}>Roommate Gender</Text>
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

        {/* Verified Badge Filter */}
        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Verified Listings Only</Text>
            <Text style={styles.switchSubLabel}>Show only ID-verified users</Text>
          </View>
          <Switch 
            value={isVerifiedOnly}
            onValueChange={setIsVerifiedOnly}
            trackColor={{ false: '#E0E0E0', true: '#111' }}
            thumbColor={'#FFF'}
          />
        </View>

      </ScrollView>

      {/* Floating Action Button at the bottom */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Show Results</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  content: {
    flex: 1,
    padding: 20,
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
    height: 56,
    fontSize: 16,
    color: '#111',
    marginBottom: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 32,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFF',
  },
  searchButton: {
    backgroundColor: '#111',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});