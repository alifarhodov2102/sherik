// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, Platform } from 'react-native'; // <-- Added Platform here

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PostScreen from '../screens/PostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatsScreen from '../screens/ChatsScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';

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
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' },
  text: { fontSize: 18, fontWeight: '600', color: '#333' }
});