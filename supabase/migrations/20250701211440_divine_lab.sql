/*
  # Create people table for census data

  1. New Tables
    - `people`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `middle_name` (text, optional)
      - `name` (text, computed from first_name + last_name)
      - `gender` (text)
      - `date_of_birth` (date)
      - `place_of_birth` (text)
      - `citizenship` (text)
      - `hometown` (text)
      - `region` (text)
      - `district` (text)
      - `electoral_area` (text)
      - `marital_status` (text)
      - `number_of_children` (integer, default 0)
      - `residential_address` (text)
      - `gps_address` (text)
      - `home_type` (text)
      - `landlord_name` (text, optional)
      - `landlord_contact` (text, optional)
      - `family_clan` (text)
      - `clan_head` (text)
      - `contact_number` (text)
      - `father_name` (text)
      - `mother_name` (text)
      - `id_type` (text)
      - `id_number` (text)
      - `occupation` (text)
      - `place_of_work` (text)
      - `education_level` (text)
      - `school_name` (text)
      - `photo_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `people` table
    - Add policy for authenticated users to manage all data
*/

CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  middle_name text,
  name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  gender text,
  date_of_birth date,
  place_of_birth text,
  citizenship text,
  hometown text,
  region text,
  district text,
  electoral_area text,
  marital_status text,
  number_of_children integer DEFAULT 0,
  residential_address text,
  gps_address text,
  home_type text,
  landlord_name text,
  landlord_contact text,
  family_clan text,
  clan_head text,
  contact_number text,
  father_name text,
  mother_name text,
  id_type text,
  id_number text,
  occupation text,
  place_of_work text,
  education_level text,
  school_name text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON people
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();