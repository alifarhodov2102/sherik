// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';

// --- FIREBASE IMPORTS ---
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

import HomeScreen from '../screens/tabs/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PostScreen from '../screens/tabs/PostScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import ChatsScreen from '../screens/tabs/ChatsScreen';
import SearchScreen from '../screens/tabs/SearchScreen';
import ChatRoomScreen from '../screens/messaging/ChatRoomScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import PaywallScreen from '../screens/messaging/PaywallScreen';
import ListingDetailScreen from '../screens/listings/ListingDetailScreen';
import MyListingsScreen from '../screens/listings/MyListingsScreen';
import EditListingScreen from '../screens/listings/EditListingScreen';
import HostProfileScreen from '../screens/listings/HostProfileScreen';
import UnlockedRoomsScreen from '../screens/listings/UnlockedRoomsScreen';
import EditProfileScreen from '../screens/auth/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// We move the tabs into their own component
function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({ 
        headerShown: false,
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopColor: '#EAEAEA',
          borderTopWidth: 1,
          paddingTop: 8,
          // NEW: Smart padding that gives iOS devices the extra room they need
          paddingBottom: Platform.OS === 'ios' ? 28 : 12, 
          height: Platform.OS === 'ios' ? 88 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconPath;

          // Point these to your exact asset filenames
          if (route.name === 'Home') {
            iconPath = require('../assets/home.png'); 
          } else if (route.name === 'Search') {
            iconPath = require('../assets/search.png');
          } else if (route.name === 'Post') {
            iconPath = require('../assets/post.png');
          } else if (route.name === 'Chats') {
            iconPath = require('../assets/chats.png');
          } else if (route.name === 'Profile') {
            iconPath = require('../assets/profile.png');
          }

          return (
            <Image
              source={iconPath}
              style={{ width: 24, height: 24, tintColor: color }} 
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // State to hold the app while Firebase checks local storage
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'MainTabs'>('Login');

  useEffect(() => {
    // Firebase Listener to check if they are already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setInitialRoute('MainTabs'); // User found! Send them home.
      } else {
        setInitialRoute('Login');    // No user! Send them to login.
      }
      setIsInitializing(false);      // Stop the loading spinner
    });

    return () => unsubscribe();
  }, []);

  // Show a blank white screen with a spinner for the 0.5 seconds it takes to check
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="HostProfile" component={HostProfileScreen} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
        <Stack.Screen name="EditListing" component={EditListingScreen} />
        <Stack.Screen name="UnlockedRooms" component={UnlockedRoomsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' },
  text: { fontSize: 18, fontWeight: '600', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
});