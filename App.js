import { useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

// Plain JavaScript — identical to what you'd write on the web.
function daysSince(isoDate) {
  const then = new Date(isoDate);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// Hardcoded for now. This is exactly the data shape from our blueprint.
const SEED = [
  { id: "1", name: "Motorcycle oil change", lastDate: "2026-05-20" },
  { id: "2", name: "Quran reading", lastDate: "2026-06-15" },
  { id: "3", name: "Backed up laptop", lastDate: "2026-04-30" },
];

export default function App() {
  const [items] = useState(SEED);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="auto" />
      <Text style={[styles.heading, { marginTop: 40 }]}>Days Since</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.days}>{daysSince(item.lastDate)} days ago</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000", paddingHorizontal: 16 },
  heading: { fontSize: 28, fontWeight: "600", marginVertical: 16, color: "#FFD700",},
  card: {
    backgroundColor: "#FFFF00",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontSize: 17, fontWeight: "500", marginBottom: 4 },
  days: { fontSize: 15, color: "#8e8e93" },
});
