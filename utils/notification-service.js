/**
 * Adds a new notification to the system
 * @param {Object} notification - The notification object
 * @param {string} notification.type - Type of notification (create, update, delete, print)
 * @param {string} notification.message - Main notification message
 * @param {string} notification.details - Optional additional details
 */
export function addNotification(notification) {
  // Get existing notifications
  const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  // Add timestamp to the notification
  const newNotification = {
    ...notification,
    timestamp: new Date().toISOString(),
  }

  // Add to the beginning of the array (newest first)
  const updatedNotifications = [newNotification, ...existingNotifications]

  // Limit to 100 notifications to prevent localStorage from getting too full
  const limitedNotifications = updatedNotifications.slice(0, 100)

  // Save back to localStorage
  localStorage.setItem("notifications", JSON.stringify(limitedNotifications))

  return newNotification
}

/**
 * Get all notifications
 * @returns {Array} Array of notification objects
 */
export function getNotifications() {
  return JSON.parse(localStorage.getItem("notifications") || "[]")
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
  localStorage.setItem("notifications", "[]")
}
