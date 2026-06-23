import { useState, useEffect, useRef } from "react";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Welcome from "./Welcome";
import styles from "../styles";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Platform,
  LogBox,
  Modal,
  Keyboard,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { EmptyComponent } from "../components/EmptyComponent";

import { daysSince, formatDate, formatTime, dayKey } from "../utils/dates";
import { STORAGE_KEY, normalize } from "../utils/storage";

LogBox.ignoreLogs(["Android Push notifications"]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
    const [items, setItems] = useState([]);
    const [draft, setDraft] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [activeId, setActiveId] = useState(null); // item being marked done
    const [noteDraft, setNoteDraft] = useState("");
    const [editing, setEditing] = useState(null); // { itemId, idx } being edited
    const [kbHeight, setKbHeight] = useState(0);
    const [ready, setReady] = useState(false);
    const [editDraft, setEditDraft] = useState("");
    const [reminderId, setReminderId] = useState(null);
    const [reminderValue, setReminderValue] = useState("1");
    const [reminderUnit, setReminderUnit] = useState("days");
  
    const insets = useSafeAreaInsets();
    const listRef = useRef(null);
  
    //too hide keyboard
    useEffect(() => {
      const show = Keyboard.addListener("keyboardDidShow", (e) =>
        setKbHeight(e.endCoordinates.height)
      );
      const hide = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
      return () => {
        show.remove();
        hide.remove();
      };
    }, []);
  
    //for notifications
    useEffect(() => {
      if (!loaded) return;
      (async () => {
        const done = await AsyncStorage.getItem("notif-reset-v1").catch(
          () => null
        );
        if (done) return;
        await Notifications.cancelAllScheduledNotificationsAsync().catch(
          () => {}
        );
        setItems((prev) =>
          prev.map((it) => ({ ...it, notifId: null, reminder: null }))
        );
        await AsyncStorage.setItem("notif-reset-v1", "1").catch(() => {});
      })();
    }, [loaded]);
  
    // Load + migrate once.
    useEffect(() => {
      (async () => {
        try {
          const json = await AsyncStorage.getItem(STORAGE_KEY);
          const raw = json != null ? JSON.parse(json) : [];
          setItems(raw.map(normalize));
        } catch (e) {
          setItems([]);
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
  
    function saveEntry() {
      const entry = { date: new Date().toISOString(), note: noteDraft.trim() };
      setItems((prev) =>
        prev.map((it) =>
          it.id === activeId ? { ...it, history: [entry, ...it.history] } : it
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
      Alert.alert(
        "Delete?",
        `Remove "${target?.name}"?`,
        [
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
        ],
        { cancelable: true }
      );
    }
    function startEdit(itemId, idx, currentNote) {
      setEditing({ itemId, idx });
      setEditDraft(currentNote || "");
      const itemIndex = items.findIndex((i) => i.id === itemId);
      if (itemIndex >= 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: itemIndex,
            animated: true,
            viewPosition: 0.2,
          });
        }, 100);
      }
    }
  
    function saveEdit() {
      if (!editing) return;
      const { itemId, idx } = editing;
      const note = editDraft.trim();
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
                ...it,
                history: it.history.map((e, i) =>
                  i === idx ? { ...e, note } : e
                ),
              }
            : it
        )
      );
      setEditing(null);
      setEditDraft("");
    }
  
    function deleteEntry(itemId, idx) {
      const item = items.find((i) => i.id === itemId);
      const note = item?.history[idx]?.note;
      Alert.alert(
        "Delete this entry?",
        note ? `"${note}" will be removed.` : "This entry will be removed.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () =>
              setItems((prev) =>
                prev.map((it) =>
                  it.id === itemId
                    ? { ...it, history: it.history.filter((_, i) => i !== idx) }
                    : it
                )
              ),
          },
        ],
        { cancelable: true }
      );
    }
  
    //notification functions
    function onBellPress(item) {
      if (item.notifId) {
        cancelReminder(item.id); // already on -> tap turns it off
      } else {
        setReminderId(item.id); // off -> open the popup
        setReminderValue("1");
        setReminderUnit("days");
      }
    }
  
    async function cancelReminder(itemId) {
      const item = items.find((i) => i.id === itemId);
      if (item?.notifId) {
        await Notifications.cancelScheduledNotificationAsync(item.notifId).catch(
          () => {}
        );
      }
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, notifId: null, reminder: null } : it
        )
      );
    }
  
    async function saveReminder() {
      const item = items.find((i) => i.id === reminderId);
      if (!item) return;
      const n = parseInt(reminderValue, 10);
      if (!n || n < 1) return;
  
      let perm = await Notifications.getPermissionsAsync();
      if (!perm.granted) perm = await Notifications.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Notifications off",
          "Enable notifications in Settings to get reminders."
        );
        return;
      }
  
      const mult =
        reminderUnit === "hours"
          ? 3600
          : reminderUnit === "weeks"
          ? 604800
          : 86400;
      if (item.notifId) {
        await Notifications.cancelScheduledNotificationAsync(item.notifId).catch(
          () => {}
        );
      }
      const notifId = await Notifications.scheduleNotificationAsync({
        content: { title: item.name, body: "Time for a check-in." },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: n * mult,
          repeats: true,
        },
      });
  
      setItems((prev) =>
        prev.map((it) =>
          it.id === reminderId
            ? { ...it, notifId, reminder: { value: n, unit: reminderUnit } }
            : it
        )
      );
      setReminderId(null);
    }
    if (!ready) return <Welcome onDone={() => setReady(true)} />;
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar style="auto" />
        {/* header code */}
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Days Since</Text>
            <Text style={styles.hint}>Long-press a card to delete it</Text>
          </View>
          <View>
            <Image
              source={require("../assets/logo.png")}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </View>
        </View>
        {/*new Task bar */}
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
        {/* Card section */}
        <FlatList
          ref={listRef}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.2,
              });
            }, 250);
          }}
          contentContainerStyle={{ paddingBottom: kbHeight + insets.bottom + 12 }}
          data={items}
          ListEmptyComponent={<EmptyComponent />}
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
                    <Text style={styles.taskName}>{item.name}</Text>
                    <Text style={styles.days}>
                      {last
                        ? `${daysSince(last.date)} days ago`
                        : "No entries yet"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onBellPress(item)}
                    hitSlop={8}
                    style={styles.bell}
                  >
                    <MaterialCommunityIcons
                      name={item.notifId ? "bell-ring" : "bell-outline"}
                      size={22}
                      color={item.notifId ? "#2E9E3F" : "#8e8e93"}
                    />
                  </Pressable>
                  <Pressable
                    style={styles.button}
                    onPress={() => openEntry(item.id)}
                  >
                    <Text style={styles.buttonText}>+ New entry</Text>
                  </Pressable>
                </View>
                {item.history.length > 0 && (
                  <View style={styles.history}>
                    {item.history.map((entry, idx) => {
                      const key = dayKey(entry.date);
                      const prev = item.history[idx - 1];
                      const isNewDay = !prev || dayKey(prev.date) !== key;
                      const multiple = dayCounts[key] > 1;
                      const isEditing =
                        editing &&
                        editing.itemId === item.id &&
                        editing.idx === idx;
                      return (
                        <View key={idx} style={styles.entry}>
                          {isNewDay && (
                            <Text style={styles.entryDate}>
                              {formatDate(entry.date)}
                            </Text>
                          )}
                          <View style={styles.entryRow}>
                            {isEditing ? (
                              <>
                                <TextInput
                                  style={[styles.entryNote, styles.entryEdit]}
                                  value={editDraft}
                                  onChangeText={setEditDraft}
                                  autoFocus
                                  multiline
                                />
                                <Pressable
                                  onPress={saveEdit}
                                  hitSlop={8}
                                  style={styles.entryIcon}
                                >
                                  <Feather
                                    name="check"
                                    size={16}
                                    color="#34c759"
                                  />
                                </Pressable>
                              </>
                            ) : (
                              <>
                                {entry.note && (
                                  <Text style={styles.entryNote}>
                                    {entry.note}
                                  </Text>
                                )}
  
                                {multiple && entry.note ? (
                                  <Text style={styles.entryTime}>
                                    {formatTime(entry.date)}
                                  </Text>
                                ) : null}
                                {entry.note && (
                                  <Pressable
                                    onPress={() =>
                                      startEdit(item.id, idx, entry.note)
                                    }
                                    hitSlop={8}
                                    style={styles.entryIcon}
                                  >
                                    <Feather
                                      name="edit-2"
                                      size={14}
                                      color="#c7c7cc"
                                    />
                                  </Pressable>
                                )}
                                {entry.note && (
                                  <Pressable
                                    onPress={() => deleteEntry(item.id, idx)}
                                    hitSlop={8}
                                    style={styles.entryIcon}
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={14}
                                      color="#c7c7cc"
                                    />
                                  </Pressable>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Pressable>
            );
          }}
        />
        {/* add entry modal */}
        <Modal
          visible={activeId !== null}
          transparent
          animationType="slide"
          onRequestClose={cancelEntry}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { paddingBottom: kbHeight + insets.bottom + 16 },
              ]}
            >
              <Text style={styles.modalTitle}>{activeItem?.name}</Text>
              <Text style={styles.modalSub}>
                Description of what you've just done
              </Text>
              <TextInput
                style={styles.modalInput}
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
          </View>
        </Modal>
        {/* remind me modal */}
        <Modal
          visible={reminderId !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setReminderId(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { paddingBottom: kbHeight + insets.bottom + 16 },
              ]}
            >
              <Text style={styles.modalTitle}>Remind me</Text>
              <Text style={styles.modalSub}>Notify me every…</Text>
              <TextInput
                style={styles.reminderInput}
                value={reminderValue}
                onChangeText={(t) => setReminderValue(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={3}
              />
              <View style={styles.unitGroup}>
                {["hours", "days", "weeks"].map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setReminderUnit(u)}
                    style={[
                      styles.unitBtn,
                      reminderUnit === u && styles.unitBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        reminderUnit === u && styles.unitTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setReminderId(null)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={saveReminder}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
  