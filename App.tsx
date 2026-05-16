// App.tsx
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import ListingCard from "./src/components/ListingCard";
import { Listing } from "./src/types";

// Fake data to test our UI
const DUMMY_LISTING: Listing = {
  id: "1",
  price: 250,
  district: "Yunusabad",
  genderPreference: "Male",
  isVerified: true,
  imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
};

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>SHERIK</Text>
      </View>

      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        <ListingCard listing={DUMMY_LISTING} />
        {/* We can add more cards here later! */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7", // Slightly gray background so the white cards pop
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: 1,
  },
  feed: {
    flex: 1,
    padding: 16,
  },
});