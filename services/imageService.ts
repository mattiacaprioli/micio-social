import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";
import { SUPABASE_URL } from "../env";

interface ImageSource {
  uri: string;
}

export const getUserImageSrc = (imagePath?: string | null): ImageSource | number => {
  if (imagePath) {
    return getSupabaseFileUrl(imagePath);
  } else {
    return require("../assets/images/defaultUser.png");
  }
};

export const getSupabaseFileUrl = (filePath: string): ImageSource => {
  return { uri: `${SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}` };
};

export const downloadFile = async (url: string): Promise<string | null> => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    console.log("Downloaded file URI:", uri);
    return uri;
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
};

export const getLocalFilePath = (filePath: string): string => {
  const fileName = filePath.split('/').pop() as string;
  return `${FileSystem.documentDirectory}${fileName}`;
};

interface UploadResult {
  success: boolean;
  data?: string;
  msg?: string;
}

export const uploadFile = async (
  folderName: string, 
  filePath: string, 
  isImage: boolean = true
): Promise<UploadResult> => {
  try {
    const fileBase64 = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageData = decode(fileBase64);
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

    return { success: true, data: fileName };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, msg: "Upload failed" };
  }
};

const getFilePath = (folderName: string, isImage: boolean): string => {
  const timestamp = new Date().getTime();
  const extension = isImage ? "png" : "mp4";
  return `${folderName}/${timestamp}.${extension}`;
};
