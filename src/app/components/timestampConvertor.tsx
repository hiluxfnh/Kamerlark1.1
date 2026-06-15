// Short, friendly message timestamps (WhatsApp-style):
//   today     -> "8:59 PM"
//   yesterday -> "Yesterday 8:59 PM"
//   this year -> "14 Jun, 8:59 PM"
//   older     -> "14 Jun 2024, 8:59 PM"
const TimeStampConvertor = (timestamp: any) => {
  try {
    let date: any;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else if (typeof timestamp === "string") {
      const n = Number(timestamp);
      date = isNaN(n) ? new Date(timestamp) : new Date(n);
    } else {
      date = new Date();
    }
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const time = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (date.toDateString() === now.toDateString()) return time;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString())
      return `Yesterday ${time}`;

    const sameYear = date.getFullYear() === now.getFullYear();
    const dateStr = date.toLocaleDateString(
      [],
      sameYear
        ? { day: "numeric", month: "short" }
        : { day: "numeric", month: "short", year: "numeric" }
    );
    return `${dateStr}, ${time}`;
  } catch (e) {
    return "";
  }
};
export default TimeStampConvertor;
