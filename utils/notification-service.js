import { notificationsService } from '@/lib/database'

/**
 * Adds a new notification to the system
 * @param {Object} notification - The notification object
 * @param {string} notification.type - Type of notification (create, update, delete, print)
 * @param {string} notification.message - Main notification message
 * @param {string} notification.details - Optional additional details
 */
export async function addNotification(notification) {
  try {
    const newNotification = await notificationsService.create(notification)
    return newNotification
  } catch (error) {
    console.error('Error adding notification:', error)
    // Fallback to localStorage if database fails
    const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const notificationWithTimestamp = {
      ...notification,
      timestamp: new Date().toISOString(),
    }
    const updatedNotifications = [notificationWithTimestamp, ...existingNotifications].slice(0, 100)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
    return notificationWithTimestamp
  }
}

/**
 * Get all notifications
 * @returns {Array} Array of notification objects
 */
export async function getNotifications() {
  try {
    return await notificationsService.getAll()
  } catch (error) {
    console.error('Error fetching notifications:', error)
    // Fallback to localStorage if database fails
    return JSON.parse(localStorage.getItem("notifications") || "[]")
  }
}

/**
 * Clear all notifications
 */
export async function clearNotifications() {
  try {
    await notificationsService.clearAll()
  } catch (error) {
    console.error('Error clearing notifications:', error)
    // Fallback to localStorage if database fails
    localStorage.setItem("notifications", "[]")
  }
}