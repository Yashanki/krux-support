/**
 * WhatsApp-style timestamp formatting utility
 * Formats timestamps to show relative dates like WhatsApp
 */

export function formatWhatsAppTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Format time as HH:MM
  const timeString = date.toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });
  
  // Check if message is from today
  if (messageDate.getTime() === today.getTime()) {
    return timeString;
  }
  
  // Check if message is from yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeString}`;
  }
  
  // Check if message is from this year
  if (date.getFullYear() === now.getFullYear()) {
    // Format as "DD/MM HH:MM" for current year
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} ${timeString}`;
  }
  
  // Format as "DD/MM/YYYY HH:MM" for previous years
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year} ${timeString}`;
}

/**
 * Get date separator text for WhatsApp-style chat
 */
export function getDateSeparator(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Today";
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Check if message is from today
  if (messageDate.getTime() === today.getTime()) {
    return "Today";
  }
  
  // Check if message is from yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  
  // Check if message is from this week
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  if (messageDate > weekAgo) {
    // Return day name for this week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  }
  
  // For older messages, return formatted date
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  // If from this year, show DD/MM/YYYY
  if (date.getFullYear() === now.getFullYear()) {
    return `${day}/${month}/${year}`;
  }
  
  return `${day}/${month}/${year}`;
}

/**
 * Check if two timestamps are from the same day
 */
export function isSameDay(timestamp1: string | Date, timestamp2: string | Date): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  
  // Check if either date is invalid
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return false;
  }
  
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Format timestamp for message bubbles (shows only time for today, date+time for older messages)
 */
export function formatMessageTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Format time as HH:MM
  const timeString = date.toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });
  
  // If message is from today, show only time
  if (messageDate.getTime() === today.getTime()) {
    return timeString;
  }
  
  // If message is from yesterday, show "Yesterday HH:MM"
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeString}`;
  }
  
  // For older messages, show date and time
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // If from this year, show DD/MM HH:MM
  if (date.getFullYear() === now.getFullYear()) {
    return `${day}/${month} ${timeString}`;
  }
  
  // If from previous year, show DD/MM/YYYY HH:MM
  const year = date.getFullYear();
  return `${day}/${month}/${year} ${timeString}`;
}
