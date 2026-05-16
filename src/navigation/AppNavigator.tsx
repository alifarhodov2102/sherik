// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

// Import our real HomeScreen
import HomeScreen from '../screens/HomeScreen';

// Temporary placeholder screens so our app doesn't crash
const SearchScreen = () => <View style={styles.center}><Text style={styles.text}>Search Screen</Text></View>;
const PostScreen = () => <View style={styles.center}><Text style={styles.text}>Post Listing Screen</Text></View>;
const ChatsScreen = () => <View style={styles.center}><Text style={styles.text}>Chats Screen</Text></View>;
const ProfileScreen = () => <View style={styles.center}><Text style={styles.text}>Profile Screen</Text></View>;

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false,
          tabBarActiveTintColor: '#111', // Dark text for active tab
          tabBarInactiveTintColor: '#888', // Gray for inactive
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Post" component={PostScreen} />
        <Tab.Screen name="Chats" component={ChatsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7'
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  }
});