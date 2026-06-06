// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';

// --- FIREBASE IMPORTS ---
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const LANGUAGES = [
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function LoginScreen({ navigation }: any) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    if (cleaned.length > 5) formatted = formatted.slice(0, 6) + ' ' + cleaned.slice(5);
    if (cleaned.length > 7) formatted = formatted.slice(0, 9) + ' ' + cleaned.slice(7);
    setPhoneNumber(formatted.slice(0, 12));
  };

  const simulateSendOTP = () => {
    if (phoneNumber.replace(/\s/g, '').length !== 9) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
    }, 1000);
  };

  const loginToFirebase = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    
    try {
      // 1. Create the session
      const userCredential = await signInAnonymously(auth);
      
      // 2. Save the typed phone number to their Firestore profile!
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        phoneNumber: `+998 ${phoneNumber}`,
        createdAt: new Date(),
      }, { merge: true }); // Merge ensures we don't overwrite their name if they log in again later
      
      // 3. Go to the Onboarding Screen instead of MainTabs!
      navigation.replace('Onboarding');
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.langCircle} onPress={() => setIsLangModalVisible(true)}>
          <Text style={styles.langCircleText}>{selectedLang.label}</Text>
        </TouchableOpacity>
        {/* Notice Skip does NOT sign you in. It leaves auth.currentUser as null! */}
        <TouchableOpacity onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.headerArea}>
          <Text style={styles.mainLogoText}>SHERIK</Text>
          <Text style={styles.title}>{step === 'PHONE' ? 'Welcome back' : 'Enter code'}</Text>
          <Text style={styles.subtitle}>
            {step === 'PHONE' 
              ? 'Enter your phone number to find your perfect roommate.' 
              : `We sent a 6-digit code to +998 ${phoneNumber}`}
          </Text>
        </View>

        {step === 'PHONE' && (
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+998</Text>
              <TextInput style={styles.input} placeholder="90 123 45 67" keyboardType="phone-pad" value={phoneNumber} onChangeText={handlePhoneChange} maxLength={12} />
            </View>
            <TouchableOpacity style={styles.button} onPress={simulateSendOTP} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Continue</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 'OTP' && (
          <View style={styles.form}>
            <Text style={styles.label}>6-Digit Code</Text>
            <View style={styles.inputContainer}>
              <TextInput style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]} placeholder="------" keyboardType="number-pad" value={code} onChangeText={setCode} maxLength={6} />
            </View>
            <TouchableOpacity style={styles.button} onPress={loginToFirebase} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  langCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  langCircleText: { fontSize: 14, fontWeight: '700', color: '#111' },
  skipText: { fontSize: 16, fontWeight: '600', color: '#666' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 40 },
  headerArea: { marginBottom: 40 },
  mainLogoText: { fontSize: 42, fontWeight: '900', color: '#111', letterSpacing: 4, alignSelf: 'center', marginBottom: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 24 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 56, marginBottom: 24 },
  prefix: { fontSize: 16, fontWeight: '600', color: '#111', marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#111', fontWeight: '500' },
  button: { backgroundColor: '#111', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});