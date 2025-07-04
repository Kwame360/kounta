import { supabase } from './supabase'

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
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data ? data.map(transformPersonFromDB) : []
  },

  // Get person by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return transformPersonFromDB(data)
  },

  // Create new person
  async create(personData) {
    const { data, error } = await supabase
      .from('people')
      .insert([personData])
      .select()
      .single()
    
    if (error) throw error
    return transformPersonFromDB(data)
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
    return transformPersonFromDB(data)
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
    return data ? data.map(transformPersonFromDB) : []
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
    return data || []
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