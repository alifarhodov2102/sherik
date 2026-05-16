import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SHERIK</Text>

      <Text style={styles.subtitle}>
        Trusted roommate platform
      </Text>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 38,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
});

