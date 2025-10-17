/**
 * Utility to generate test messages with different dates for testing WhatsApp-style timestamps
 * This can be used for development and testing purposes
 */

export function generateTestMessages() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      sender: "user" as const,
      text: "Hello, I need help with my loan application",
      time: formatDateWithTime(yesterday, "14:30")
    },
    {
      sender: "bot" as const,
      text: "I'm here to help! What specific assistance do you need with your loan application?",
      time: formatDateWithTime(yesterday, "14:31")
    },
    {
      sender: "user" as const,
      text: "I submitted my documents but haven't heard back",
      time: formatDateWithTime(yesterday, "14:32")
    },
    {
      sender: "bot" as const,
      text: "I understand your concern. Let me check the status of your application.",
      time: formatDateWithTime(yesterday, "14:33")
    },
    {
      sender: "user" as const,
      text: "Thanks! When can I expect to hear back?",
      time: formatDateWithTime(twoDaysAgo, "10:15")
    },
    {
      sender: "bot" as const,
      text: "Your application is currently under review. You should receive an update within 2-3 business days.",
      time: formatDateWithTime(twoDaysAgo, "10:16")
    },
    {
      sender: "user" as const,
      text: "Perfect, thank you for the update!",
      time: formatDateWithTime(lastWeek, "16:45")
    },
    {
      sender: "bot" as const,
      text: "You're welcome! Is there anything else I can help you with today?",
      time: formatDateWithTime(lastWeek, "16:46")
    },
    {
      sender: "user" as const,
      text: "Actually, yes. I have a question about interest rates.",
      time: formatDateWithTime(lastMonth, "09:20")
    },
    {
      sender: "bot" as const,
      text: "I'd be happy to help with questions about interest rates. What would you like to know?",
      time: formatDateWithTime(lastMonth, "09:21")
    }
  ];
}

function formatDateWithTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date.toISOString();
}
