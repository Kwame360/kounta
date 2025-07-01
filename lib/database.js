import { supabase } from './supabase'

// People operations
export const peopleService = {
  // Get all people
  async getAll() {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get person by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new person
  async create(personData) {
    const { data, error } = await supabase
      .from('people')
      .insert([personData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update person
  async update(id, personData) {
    const { data, error } = await supabase
      .from('people')
      .update(personData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete person
  async delete(id) {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Batch create people
  async createBatch(peopleData) {
    const { data, error } = await supabase
      .from('people')
      .insert(peopleData)
      .select()
    
    if (error) throw error
    return data
  }
}

// Notifications operations
export const notificationsService = {
  // Get all notifications
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) throw error
    return data
  },

  // Create notification
  async create(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Clear all notifications
  async clearAll() {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (error) throw error
    return true
  }
}