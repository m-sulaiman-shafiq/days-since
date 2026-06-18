import { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, Pressable, TextInput, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

const STORAGE_KEY = "days-since-items";

function daysSince(isoDate) {
  const then = new Date(isoDate);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

const SEED = [
  { id: "1", name: "Motorcycle oil change", lastDate: "2026-05-20" },
  { id: "2", name: "Quran reading", lastDate: "2026-06-15" },
  { id: "3", name: "Backed up laptop", lastDate: "2026-04-30" },
];

export default function App() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load saved items once, when the app starts.
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        setItems(json != null ? JSON.parse(json) : SEED);
      } catch (e) {
        setItems(SEED); // if reading fails, fall back to seeds
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save items whenever they change — but only after the initial load.
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  function resetItem(id) {
    const today = new Date().toISOString().slice(0, 10);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, lastDate: today } : item
      )
    );
  }

  function addItem() {
    const name = draft.trim();
    if (!name) return;
    const today = new Date().toISOString().slice(0, 10);
    const newItem = { id: Date.now().toString(), name, lastDate: today };
    setItems((prev) => [newItem, ...prev]);
    setDraft("");
  }

  function deleteItem(id) {
    const target = items.find((i) => i.id === id);
    Alert.alert("Delete?", `Remove "${target?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setItems((prev) => prev.filter((item) => item.id !== id)),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="auto" />
      <Text style={styles.heading}>Days Since</Text>
      <Text style={styles.hint}>Long-press a card to delete it</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="+ Add New Task"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onLongPress={() => deleteItem(item.id)}>
            <View style={styles.cardText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.days}>{daysSince(item.lastDate)} days ago</Text>
            </View>
            <Pressable style={styles.button} onPress={() => resetItem(item.id)}>
              <Text style={styles.buttonText}>I did it today</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f2f2f7", paddingHorizontal: 16 },
  heading: { fontSize: 28, fontWeight: "600", marginTop: 16 },
  hint: { fontSize: 13, color: "#8e8e93", marginBottom: 16 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
  },
  addButton: { backgroundColor: "#34c759", borderRadius: 12, paddingHorizontal: 20, justifyContent: "center" },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  cardText: { flex: 1, marginRight: 12 },
  name: { fontSize: 17, fontWeight: "500", marginBottom: 4 },
  days: { fontSize: 15, color: "#8e8e93" },
  button: { backgroundColor: "#007aff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});