// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  Pressable
} from 'react-native';

const LANGUAGES = [
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function LoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    if (cleaned.length > 5) formatted = formatted.slice(0, 6) + ' ' + cleaned.slice(5);
    if (cleaned.length > 7) formatted = formatted.slice(0, 9) + ' ' + cleaned.slice(7);
    
    setPhoneNumber(formatted.slice(0, 12));
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top Navigation Bar - Now just Language and Skip */}
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.langCircle} 
          onPress={() => setIsLangModalVisible(true)}
        >
          <Text style={styles.langCircleText}>{selectedLang.label}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <View style={styles.headerArea}>
          {/* Main Logo Placeholder - Centered exactly where you circled */}
          <Text style={styles.mainLogoText}>SHERIK</Text>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your phone number to find your perfect roommate.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>+998</Text>
            <TextInput
              style={styles.input}
              placeholder="90 123 45 67"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholderTextColor="#A0A0A0"
              maxLength={12}
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.replace('MainTabs')} 
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Language Selection Modal */}
      <Modal
        visible={isLangModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLangModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            {LANGUAGES.map((lang) => (
              <TouchableOpacity 
                key={lang.code}
                style={[
                  styles.langOption, 
                  selectedLang.code === lang.code && styles.langOptionSelected
                ]}
                onPress={() => {
                  setSelectedLang(lang);
                  setIsLangModalVisible(false);
                }}
              >
                <Text style={styles.langOptionFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.langOptionText,
                  selectedLang.code === lang.code && styles.langOptionTextSelected
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes Lang to left, Skip to right
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  langCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langCircleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 40,
  },
  mainLogoText: {
    fontSize: 42, // Very large to act as a placeholder
    fontWeight: '900',
    color: '#111',
    letterSpacing: 4,
    alignSelf: 'center', // Centers it right where you drew the circle
    marginBottom: 60, // Creates the space before "Welcome back"
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#111',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  langOptionSelected: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#111',
  },
  langOptionFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  langOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  langOptionTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
});