import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Platform,
  LogBox,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";

const STORAGE_KEY = "days-since-items";
const REMINDER_SECONDS = 10; // testing; real use: 7 * 24 * 60 * 60

LogBox.ignoreLogs(["Android Push notifications"]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function daysSince(isoDate) {
  const then = new Date(isoDate);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function dayKey(isoDate) {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Upgrades old { name, lastDate } items to the new history shape.
function normalize(item) {
  if (Array.isArray(item.history)) return item;
  return {
    id: item.id,
    name: item.name,
    notifId: item.notifId,
    history: item.lastDate ? [{ date: item.lastDate, note: "" }] : [],
  };
}

const SEED = [
  {
    id: "1",
    name: "Quran reading",
    history: [
      { date: "2026-06-15", note: "Surah Al-Baqarah, Ayah 142" },
      { date: "2026-06-10", note: "Surah Al-Baqarah, Ayah 88" },
    ],
  },
  {
    id: "2",
    name: "Motorcycle oil change",
    history: [{ date: "2026-05-20", note: "" }],
  },
  {
    id: "3",
    name: "Backed up laptop",
    history: [{ date: "2026-04-30", note: "Full backup to external drive" }],
  },
];

export default function App() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState(null); // item being marked done
  const [noteDraft, setNoteDraft] = useState("");

  // Load + migrate once.
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        const raw = json != null ? JSON.parse(json) : SEED;
        setItems(raw.map(normalize));
      } catch (e) {
        setItems(SEED);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save on change (after load).
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  // Permission + Android channel.
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })();
  }, []);

  const activeItem = items.find((i) => i.id === activeId);

  function openEntry(id) {
    setActiveId(id);
    setNoteDraft("");
  }

  function cancelEntry() {
    setActiveId(null);
    setNoteDraft("");
  }

  async function saveEntry() {
    const entry = { date: new Date().toISOString(), note: noteDraft.trim() };

    // Reschedule this item's reminder.
    let notifId = activeItem?.notifId;
    try {
      if (activeItem?.notifId) {
        await Notifications.cancelScheduledNotificationAsync(
          activeItem.notifId
        );
      }
      notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Days Since",
          body: `Time for "${activeItem.name}" again?`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: REMINDER_SECONDS,
        },
      });
    } catch (e) {
      /* ignore scheduling errors */
    }

    setItems((prev) =>
      prev.map((it) =>
        it.id === activeId
          ? { ...it, history: [entry, ...it.history], notifId }
          : it
      )
    );
    cancelEntry();
  }

  function addItem() {
    const name = draft.trim();
    if (!name) return;
    const newItem = { id: Date.now().toString(), name, history: [] };
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
        onPress: () => {
          if (target?.notifId) {
            Notifications.cancelScheduledNotificationAsync(
              target.notifId
            ).catch(() => {});
          }
          setItems((prev) => prev.filter((it) => it.id !== id));
        },
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
          placeholder="Add something to track…"
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
        renderItem={({ item }) => {
          const last = item.history[0];
          const dayCounts = {};
          item.history.forEach((e) => {
            const k = dayKey(e.date);
            dayCounts[k] = (dayCounts[k] || 0) + 1;
          });
          return (
            <Pressable
              style={styles.card}
              onLongPress={() => deleteItem(item.id)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.days}>
                    {last
                      ? `${daysSince(last.date)} days ago`
                      : "No entries yet"}
                  </Text>
                </View>
                <Pressable
                  style={styles.button}
                  onPress={() => openEntry(item.id)}
                >
                  <Text style={styles.buttonText}>I did it today</Text>
                </Pressable>
              </View>

              {item.history.length > 0 && (
                <View style={styles.history}>
                  {item.history.map((entry, idx) => (
                    <View key={idx} style={styles.entry}>
                      <Text style={styles.entryDate}>
                        {formatDate(entry.date)}
                        {dayCounts[dayKey(entry.date)] > 1 ? (
                          <Text style={styles.entryTime}>
                            {" "}
                            {formatTime(entry.date)}
                          </Text>
                        ) : null}
                      </Text>
                      {entry.note ? (
                        <Text style={styles.entryNote}>{entry.note}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <Modal
        visible={activeId !== null}
        transparent
        animationType="slide"
        onRequestClose={cancelEntry}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{activeItem?.name}</Text>
            <Text style={styles.modalSub}>Where did you get to?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Surah Al-Baqarah, Ayah 142 (optional)"
              value={noteDraft}
              onChangeText={setNoteDraft}
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={cancelEntry}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveEntry}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f2f2f7", paddingHorizontal: 16 },
  heading: { fontSize: 28, fontWeight: "600", marginTop: 50 },
  hint: { fontSize: 13, color: "#8e8e93", marginBottom: 16 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#34c759",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: { flex: 1, marginRight: 12 },
  name: { fontSize: 17, fontWeight: "500", marginBottom: 4 },
  days: { fontSize: 12, color: "#8e8e93" },
  button: {
    backgroundColor: "#007aff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  history: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f7",
    paddingTop: 8,
  },
  entry: { paddingVertical: 4 },
  entryDate: { fontSize: 13, fontWeight: "600", color: "#3a3a3c" },
  entryNote: { fontSize: 14, color: "#636366", marginTop: 1 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 20, fontWeight: "600" },
  modalSub: { fontSize: 14, color: "#8e8e93", marginTop: 2, marginBottom: 12 },
  modalInput: {
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#e5e5ea" },
  cancelBtnText: { fontSize: 16, fontWeight: "600", color: "#3a3a3c" },
  saveBtn: { backgroundColor: "#007aff" },
  saveBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  entryTime: { color: "#8e8e93", fontWeight: "400", fontSize: 10, paddingVertical: 6, marginBottom: 4 }
});
