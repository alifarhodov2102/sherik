// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator 
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function OnboardingScreen({ navigation }: any) {
  const [occupation, setOccupation] = useState<'Student' | 'Professional' | 'Other' | null>(null);
  const [smoker, setSmoker] = useState<'Yes' | 'No' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    // Force them to answer the questions
    if (!occupation || !smoker) {
      alert("Please answer both questions to continue!");
      return;
    }

    if (!auth.currentUser) return;
    setIsLoading(true);

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      // Save their answers directly to their profile
      await setDoc(userDocRef, {
        occupation: occupation,
        smoker: smoker,
        onboardingComplete: true,
        updatedAt: new Date()
      }, { merge: true });

      // Boom! Send them to the main app feed
      navigation.replace('MainTabs');
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.welcomeText}>Welcome to SHERIK! 🎉</Text>
        <Text style={styles.subtitleText}>Let's get your profile set up so you can find the perfect roommate. It only takes 3 seconds.</Text>

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>1. What do you do?</Text>
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
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>2. Do you smoke?</Text>
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
        </View>

      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, (!occupation || !smoker) && styles.buttonDisabled]} 
          onPress={handleFinish}
          disabled={!occupation || !smoker || isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enter App</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  welcomeText: { fontSize: 32, fontWeight: '800', color: '#111', marginBottom: 12 },
  subtitleText: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 40 },
  questionBlock: { marginBottom: 32 },
  questionText: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  chipContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EAEAEA' },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 16, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  footer: { padding: 24, paddingBottom: 40 },
  button: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#CCC' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});