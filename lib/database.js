import { supabase } from './supabase'

// Helper function to check if Supabase is configured
function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Helper function to transform database row to app format
function transformPersonFromDB(dbPerson) {
  if (!dbPerson) return null
  
  return {
    id: dbPerson.id,
    name: dbPerson.name,
    firstName: dbPerson.first_name,
    lastName: dbPerson.last_name,
    middleName: dbPerson.middle_name,
    gender: dbPerson.gender,
    dateOfBirth: dbPerson.date_of_birth,
    placeOfBirth: dbPerson.place_of_birth,
    citizenship: dbPerson.citizenship,
    hometown: dbPerson.hometown,
    region: dbPerson.region,
    district: dbPerson.district,
    electoralArea: dbPerson.electoral_area,
    maritalStatus: dbPerson.marital_status,
    numberOfChildren: dbPerson.number_of_children,
    residentialAddress: dbPerson.residential_address,
    gpsAddress: dbPerson.gps_address,
    homeType: dbPerson.home_type,
    landlordName: dbPerson.landlord_name,
    landlordContact: dbPerson.landlord_contact,
    familyClan: dbPerson.family_clan,
    clanHead: dbPerson.clan_head,
    contactNumber: dbPerson.contact_number,
    fatherName: dbPerson.father_name,
    motherName: dbPerson.mother_name,
    idType: dbPerson.id_type,
    idNumber: dbPerson.id_number,
    occupation: dbPerson.occupation,
    placeOfWork: dbPerson.place_of_work,
    educationLevel: dbPerson.education_level,
    schoolName: dbPerson.school_name,
    photoUrl: dbPerson.photo_url,
    createdAt: dbPerson.created_at,
    updatedAt: dbPerson.updated_at,
    // Keep snake_case versions for compatibility
    first_name: dbPerson.first_name,
    last_name: dbPerson.last_name,
    middle_name: dbPerson.middle_name,
    date_of_birth: dbPerson.date_of_birth,
    place_of_birth: dbPerson.place_of_birth,
    electoral_area: dbPerson.electoral_area,
    marital_status: dbPerson.marital_status,
    number_of_children: dbPerson.number_of_children,
    residential_address: dbPerson.residential_address,
    gps_address: dbPerson.gps_address,
    home_type: dbPerson.home_type,
    landlord_name: dbPerson.landlord_name,
    landlord_contact: dbPerson.landlord_contact,
    family_clan: dbPerson.family_clan,
    clan_head: dbPerson.clan_head,
    contact_number: dbPerson.contact_number,
    father_name: dbPerson.father_name,
    mother_name: dbPerson.mother_name,
    id_type: dbPerson.id_type,
    id_number: dbPerson.id_number,
    place_of_work: dbPerson.place_of_work,
    education_level: dbPerson.education_level,
    school_name: dbPerson.school_name,
    photo_url: dbPerson.photo_url,
    created_at: dbPerson.created_at,
    updated_at: dbPerson.updated_at
  }
}

// People operations
export const peopleService = {
  // Get all people
  async getAll() {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('[Database] Supabase not configured. Using localStorage fallback.')
      console.warn('[Database] To enable Supabase, create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      return storedPeople
    }

    try {
      console.log('[Database] Fetching people from Supabase...')
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[Database] Supabase error:', error)
        // Check if it's a configuration error
        if (error.message && error.message.includes('not configured')) {
          console.warn('[Database] Supabase not properly configured. Falling back to localStorage.')
          const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
          return storedPeople
        }
        throw error
      }
      
      console.log('[Database] Successfully fetched', data?.length || 0, 'people from Supabase')
      return data ? data.map(transformPersonFromDB) : []
    } catch (error) {
      console.error('[Database] Error fetching people:', error)
      // Fallback to localStorage if database fails
      console.log('[Database] Falling back to localStorage...')
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      return storedPeople
    }
  },

  // Get person by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      return transformPersonFromDB(data)
    } catch (error) {
      console.error('Error fetching person by ID:', error)
      // Fallback to localStorage
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const person = storedPeople.find(p => p.id === id)
      return person || null
    }
  },

  // Create new person
  async create(personData) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('[Database] Supabase not configured. Saving to localStorage.')
      const newPerson = {
        ...personData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const updatedPeople = [newPerson, ...storedPeople]
      localStorage.setItem("people", JSON.stringify(updatedPeople))
      return transformPersonFromDB(newPerson)
    }

    try {
      console.log('[Database] Creating person in Supabase:', personData)
      const { data, error } = await supabase
        .from('people')
        .insert([personData])
        .select()
        .single()
      
      if (error) {
        console.error('[Database] Supabase error:', error)
        // Check if it's a configuration error
        if (error.message && error.message.includes('not configured')) {
          console.warn('[Database] Supabase not properly configured. Saving to localStorage.')
          const newPerson = {
            ...personData,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
          const updatedPeople = [newPerson, ...storedPeople]
          localStorage.setItem("people", JSON.stringify(updatedPeople))
          return transformPersonFromDB(newPerson)
        }
        throw error
      }
      
      console.log('[Database] Successfully created person in Supabase:', data)
      return transformPersonFromDB(data)
    } catch (error) {
      console.error('[Database] Error creating person:', error)
      // Fallback to localStorage
      const newPerson = {
        ...personData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const updatedPeople = [newPerson, ...storedPeople]
      localStorage.setItem("people", JSON.stringify(updatedPeople))
      return transformPersonFromDB(newPerson)
    }
  },

  // Update person
  async update(id, personData) {
    try {
      console.log('Updating person in database:', id, personData)
      const { data, error } = await supabase
        .from('people')
        .update(personData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Successfully updated person:', data)
      return transformPersonFromDB(data)
    } catch (error) {
      console.error('Error updating person:', error)
      // Fallback to localStorage
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const updatedPeople = storedPeople.map(person => 
        person.id === id 
          ? { ...person, ...personData, updated_at: new Date().toISOString() }
          : person
      )
      localStorage.setItem("people", JSON.stringify(updatedPeople))
      const updatedPerson = updatedPeople.find(p => p.id === id)
      return transformPersonFromDB(updatedPerson)
    }
  },

  // Delete person
  async delete(id) {
    try {
      console.log('Deleting person from database:', id)
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Successfully deleted person:', id)
      return true
    } catch (error) {
      console.error('Error deleting person:', error)
      // Fallback to localStorage
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const updatedPeople = storedPeople.filter(person => person.id !== id)
      localStorage.setItem("people", JSON.stringify(updatedPeople))
      return true
    }
  },

  // Batch create people
  async createBatch(peopleData) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('[Database] Supabase not configured. Saving to localStorage.')
      const newPeople = peopleData.map(person => ({
        ...person,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const updatedPeople = [...newPeople, ...storedPeople]
      localStorage.setItem("people", JSON.stringify(updatedPeople))
      return newPeople.map(transformPersonFromDB)
    }

    try {
      console.log('[Database] Creating batch of', peopleData.length, 'people in Supabase...')
      const { data, error } = await supabase
        .from('people')
        .insert(peopleData)
        .select()
      
      if (error) {
        console.error('[Database] Supabase error:', error)
        // Check if it's a configuration error
        if (error.message && error.message.includes('not configured')) {
          console.warn('[Database] Supabase not properly configured. Saving to localStorage.')
          const newPeople = peopleData.map(person => ({
            ...person,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
          const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
          const updatedPeople = [...newPeople, ...storedPeople]
          localStorage.setItem("people", JSON.stringify(updatedPeople))
          return newPeople.map(transformPersonFromDB)
        }
        throw error
      }
      
      console.log('[Database] Successfully created', data?.length || 0, 'people in Supabase')
      return data ? data.map(transformPersonFromDB) : []
    } catch (error) {
      console.error('[Database] Error creating batch:', error)
      // Fallback to localStorage
      const newPeople = peopleData.map(person => ({
        ...person,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      const updatedPeople = [...newPeople, ...storedPeople]
      localStorage.setItem("people", JSON.stringify(updatedPeople))
      return newPeople.map(transformPersonFromDB)
    }
  }
}

// Notifications operations
export const notificationsService = {
  // Get all notifications
  async getAll() {
    try {
      console.log('Fetching notifications from database...')
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Successfully fetched notifications:', data?.length || 0, 'records')
      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem("notifications") || "[]")
    }
  },

  // Create notification
  async create(notificationData) {
    try {
      console.log('Creating notification in database:', notificationData)
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Successfully created notification:', data)
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      // Fallback to localStorage
      const newNotification = {
        ...notificationData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const updatedNotifications = [newNotification, ...storedNotifications].slice(0, 100)
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
      return newNotification
    }
  },

  // Clear all notifications
  async clearAll() {
    try {
      console.log('Clearing all notifications from database...')
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Successfully cleared all notifications')
      return true
    } catch (error) {
      console.error('Error clearing notifications:', error)
      // Fallback to localStorage
      localStorage.setItem("notifications", "[]")
      return true
    }
  }
}