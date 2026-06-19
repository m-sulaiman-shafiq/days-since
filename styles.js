import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f2f2f7", paddingHorizontal: 16 },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 46,
    marginBottom: 16,
  },

  headerIcon: { width: 62, height: 62 },
  hint: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 4,
  },
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
  cardText: { flex: 1, marginRight: 12},
  taskName: { fontSize: 17, fontWeight: "500", marginBottom: 4, color: "#34c759" },
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
  entry: { paddingVertical: 2 },
  entryDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a3a3c",
    paddingTop: 8,
  },
  entryNote: { fontSize: 16, color: "#636366", flex: 1 },
  entryRow: { flexDirection: "row", alignItems: "baseline" },

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
  entryTime: {
    color: "#8e8e93",
    fontWeight: "400",
    fontSize: 10,
    marginRight: 6,
  },
  entryIcon: { marginLeft: 12 },
  entryEmpty: { color: "#c7c7cc" },
  entryEdit: {
    borderBottomWidth: 1,
    borderBottomColor: "#007aff",
    paddingVertical: 0,
  },
  //bell notificaiton styles
  bell: { marginRight: 12 },
  reminderInput: {
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  unitGroup: { flexDirection: "row", gap: 8 },
  unitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f2f2f7",
    alignItems: "center",
  },
  unitBtnActive: { backgroundColor: "#2E9E3F" },
  unitText: { fontSize: 15, color: "#3a3a3c", textTransform: "capitalize" },
  unitTextActive: { color: "#fff", fontWeight: "600" },

  //empty container styles
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1c1c1e",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 15,
    color: "#8e8e93",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  suggestionCard: {
    width: "100%",
    borderRadius: 16,
    paddingLeft: 90,
    textAlign: "center",
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    color: "#8e8e93",
  },

  suggestionEmoji: {
    fontSize: 22,
    marginRight: 14,
  },

  suggestionText: {
    fontSize: 16,
    color: "#8e8e93",
  },
  //Welcome screen styles
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 160, height: 160 },
});
