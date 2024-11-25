import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";
import { SUPABASE_URL } from "../env";

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    return getSupabaseFileUrl(imagePath);
  } else {
    return require("../assets/images/defaultUser.png");
  }
};

export  const getSupabaseFileUrl = filePath => {
  if(filePath){
    return {uri: `${SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`}
  }
  return null;
};

export const uploadFile = async (folderName, filePath, isImage = true) => {
  try {
    const fileBase64 = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageData = decode(fileBase64); // convert base64 to binary
    const fileName = getFilePath(folderName, isImage);

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/png" : "video/mp4",
      });

    if (error) {
      console.error("File upload error:", error);
      return { success: false, msg: "Could not upload media" };
    }

    return { success: true, data: data.path };
  } catch (error) {
    console.error("File upload error:", error);
    return { success: false, msg: "Could not upload media" };
  }
};

export const getFilePath = (folderName, isImage) => {
  return `${folderName}/${new Date().getTime()}.${isImage ? "png" : "mp4"}`;
  // profile/1234567890.png    if you upload image in profile folder
  // images/1234567890.png    if you upload image in images folder
};
