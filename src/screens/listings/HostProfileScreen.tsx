// src/screens/listings/HostProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function HostProfileScreen({ route, navigation }: any) {
  const { hostId, listing } = route.params;
  
  const [hostData, setHostData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const hostDoc = await getDoc(doc(db, 'users', hostId));
        if (hostDoc.exists()) {
          setHostData(hostDoc.data());
        }
      } catch (error) {
        console.error("Error fetching host:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHost();
  }, [hostId]);

  const handleCall = () => {
    if (hostData?.phoneNumber) {
      // Formats the number for the phone dialer
      const cleanNumber = hostData.phoneNumber.replace(/\s/g, '');
      Linking.openURL(`tel:${cleanNumber}`);
    } else {
      Alert.alert("Error", "No phone number available for this user.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Info</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {hostData?.name ? hostData.name.charAt(0).toUpperCase() : '👤'}
          </Text>
        </View>

        <Text style={styles.name}>{hostData?.name || 'Anonymous User'}</Text>
        <Text style={styles.subtitle}>
          {hostData?.occupation || 'Roommate'} • Smokes: {hostData?.smoker || 'No'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Unlocked Phone Number</Text>
          <Text style={styles.phoneNumber}>{hostData?.phoneNumber || 'Not provided'}</Text>
          
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callButtonText}>Call {hostData?.name?.split(' ')[0] || 'User'}</Text>
          </TouchableOpacity>
        </View>

        {/* Small reference to the room they are talking about */}
        {listing && (
          <View style={styles.referenceCard}>
            <Text style={styles.referenceLabel}>Regarding</Text>
            <Text style={styles.referenceText}>{listing.roomType || 'Single'} Room in {listing.district}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  backButton: { width: 60 },
  backText: { fontSize: 16, fontWeight: '600', color: '#111' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  
  content: { padding: 24, alignItems: 'center' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 20 },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },

  card: { backgroundColor: '#FFF', width: '100%', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  phoneNumber: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 24, letterSpacing: 1 },
  
  callButton: { backgroundColor: '#00C853', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  callButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  referenceCard: { backgroundColor: '#EAEAEA', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  referenceLabel: { fontSize: 12, color: '#666', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  referenceText: { fontSize: 14, color: '#111', fontWeight: '700' }
});