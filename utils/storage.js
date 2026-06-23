export const STORAGE_KEY = "days-since-items";

export function normalize(item) {
  if (Array.isArray(item.history)) return item;
  return {
    id: item.id,
    name: item.name,
    notifId: item.notifId,
    history: item.lastDate ? [{ date: item.lastDate, note: "" }] : [],
  };
}