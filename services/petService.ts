import { supabase } from "../lib/supabase";
import { PetRow } from "../src/types/supabase";
import { ApiResponse, Pet, CreatePetData, UpdatePetData } from "./types";
import { uploadFile } from "./imageService";

const mapPetRowToPet = (petRow: PetRow): Pet => {
  return {
    id: petRow.id,
    userId: petRow.user_id,
    name: petRow.name,
    breed: petRow.breed,
    age: petRow.age,
    gender: petRow.gender,
    bio: petRow.bio,
    image: petRow.image,
    weight: petRow.weight,
    birthDate: petRow.birth_date,
    isNeutered: petRow.is_neutered,
    medicalNotes: petRow.medical_notes,
    createdAt: petRow.created_at,
    updatedAt: petRow.updated_at,
  };
};

const mapCreatePetDataToPetInsert = (petData: CreatePetData): Omit<PetRow, "id" | "created_at" | "updated_at"> => {
  return {
    user_id: petData.userId,
    name: petData.name,
    breed: petData.breed,
    age: petData.age,
    gender: petData.gender,
    bio: petData.bio,
    image: petData.image,
    weight: petData.weight,
    birth_date: petData.birthDate,
    is_neutered: petData.isNeutered,
    medical_notes: petData.medicalNotes,
  };
};

const mapUpdatePetDataToPetUpdate = (petData: UpdatePetData): Partial<Omit<PetRow, "id" | "created_at" | "updated_at">> => {
  const updateData: Partial<Omit<PetRow, "id" | "created_at" | "updated_at">> = {};
  
  if (petData.name !== undefined) updateData.name = petData.name;
  if (petData.breed !== undefined) updateData.breed = petData.breed;
  if (petData.age !== undefined) updateData.age = petData.age;
  if (petData.gender !== undefined) updateData.gender = petData.gender;
  if (petData.bio !== undefined) updateData.bio = petData.bio;
  if (petData.image !== undefined) updateData.image = petData.image;
  if (petData.weight !== undefined) updateData.weight = petData.weight;
  if (petData.birthDate !== undefined) updateData.birth_date = petData.birthDate;
  if (petData.isNeutered !== undefined) updateData.is_neutered = petData.isNeutered;
  if (petData.medicalNotes !== undefined) updateData.medical_notes = petData.medicalNotes;

  return updateData;
};

export const getUserPets = async (userId: string): Promise<ApiResponse<Pet[]>> => {
  try {
    console.log("getUserPets called with userId:", userId);

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getUserPets error:", error);
      return { success: false, msg: error.message };
    }

    const pets = data.map(mapPetRowToPet);
    console.log(`Found ${pets.length} pets for user ${userId}`);
    
    return { success: true, data: pets };
  } catch (error) {
    const err = error as Error;
    console.error("getUserPets error:", err);
    return { success: false, msg: err.message };
  }
};

export const createPet = async (petData: CreatePetData): Promise<ApiResponse<Pet>> => {
  try {
    console.log("createPet called with data:", JSON.stringify(petData));

    const insertData = mapCreatePetDataToPetInsert(petData);

    const { data, error } = await supabase
      .from("pets")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("createPet error:", error);
      return { success: false, msg: error.message };
    }

    const pet = mapPetRowToPet(data);
    console.log("Pet created successfully:", pet.id);

    return { success: true, data: pet };
  } catch (error) {
    const err = error as Error;
    console.error("createPet error:", err);
    return { success: false, msg: err.message };
  }
};

export const updatePet = async (petId: string, petData: UpdatePetData): Promise<ApiResponse<Pet>> => {
  try {
    console.log("updatePet called with petId:", petId);
    console.log("updatePet data:", JSON.stringify(petData));

    const updateData = mapUpdatePetDataToPetUpdate(petData);

    const { data, error } = await supabase
      .from("pets")
      .update(updateData)
      .eq("id", petId)
      .select()
      .single();

    if (error) {
      console.error("updatePet error:", error);
      return { success: false, msg: error.message };
    }

    const pet = mapPetRowToPet(data);
    console.log("Pet updated successfully:", pet.id);

    return { success: true, data: pet };
  } catch (error) {
    const err = error as Error;
    console.error("updatePet error:", err);
    return { success: false, msg: err.message };
  }
};

export const deletePet = async (petId: string): Promise<ApiResponse<void>> => {
  try {
    console.log("deletePet called with petId:", petId);

    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId);

    if (error) {
      console.error("deletePet error:", error);
      return { success: false, msg: error.message };
    }

    console.log("Pet deleted successfully:", petId);
    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("deletePet error:", err);
    return { success: false, msg: err.message };
  }
};

export const getPetById = async (petId: string): Promise<ApiResponse<Pet>> => {
  try {
    console.log("getPetById called with petId:", petId);

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    if (error) {
      console.error("getPetById error:", error);
      return { success: false, msg: error.message };
    }

    const pet = mapPetRowToPet(data);
    console.log("Pet found:", pet.name);

    return { success: true, data: pet };
  } catch (error) {
    const err = error as Error;
    console.error("getPetById error:", err);
    return { success: false, msg: err.message };
  }
};

export const uploadPetImage = async (petId: string, imageUri: string): Promise<ApiResponse<string>> => {
  try {
    console.log("uploadPetImage called with petId:", petId);

    // Upload dell'immagine usando il servizio esistente
    const uploadResult = await uploadFile("pets", imageUri, true);
    
    if (!uploadResult.success) {
      return { success: false, msg: "Failed to upload image" };
    }

    // Aggiorna il pet con la nuova URL dell'immagine
    const updateResult = await updatePet(petId, { image: uploadResult.data });
    
    if (!updateResult.success) {
      return { success: false, msg: "Failed to update pet with new image" };
    }

    console.log("Pet image uploaded successfully");
    return { success: true, data: uploadResult.data };
  } catch (error) {
    const err = error as Error;
    console.error("uploadPetImage error:", err);
    return { success: false, msg: err.message };
  }
};

export const getUserPetsCount = async (userId: string): Promise<ApiResponse<number>> => {
  try {
    console.log("getUserPetsCount called with userId:", userId);

    const { count, error } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("getUserPetsCount error:", error);
      return { success: false, msg: error.message };
    }

    console.log(`User ${userId} has ${count} pets`);
    return { success: true, data: count || 0 };
  } catch (error) {
    const err = error as Error;
    console.error("getUserPetsCount error:", err);
    return { success: false, msg: err.message };
  }
};