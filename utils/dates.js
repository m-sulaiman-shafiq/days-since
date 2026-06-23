export function daysSince(isoDate) {
    const then = new Date(isoDate);
    const now = new Date();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
  }
  
  export function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString(undefined, {
      day: "numeric", month: "short", year: "numeric",
    });
  }
  
  export function formatTime(isoDate) {
    return new Date(isoDate).toLocaleTimeString(undefined, {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  }
  
  export function dayKey(isoDate) {
    const d = new Date(isoDate);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }