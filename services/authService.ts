import { supabase } from "../lib/supabase";
import { ApiResponse } from "./types";

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  email: string;
}

export interface VerifyPasswordData {
  email: string;
  password: string;
}

export const verifyCurrentPassword = async (
  data: VerifyPasswordData
): Promise<ApiResponse<boolean>> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { 
        success: false, 
        msg: "Current password invalid" 
      };
    }

    return { success: true, data: true };
  } catch (error) {
    const err = error as Error;
    console.error("verifyCurrentPassword error:", err);
    return { 
      success: false, 
      msg: "Error while verifying password" 
    };
  }
};

export const changePassword = async (
  data: ChangePasswordData
): Promise<ApiResponse<boolean>> => {
  try {
    const passwordValidation = validatePasswordStrength(data.newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        msg: passwordValidation.message || "Invalid password"
      };
    }

    if (data.currentPassword === data.newPassword) {
      return {
        success: false,
        msg: "New password must be different from current password"
      };
    }

    const verifyResult = await verifyCurrentPassword({
      email: data.email,
      password: data.currentPassword
    });

    if (!verifyResult.success) {
      return verifyResult;
    }

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });

    if (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        msg: error.message || "Error updating password"
      };
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    const err = error as Error;
    console.error("changePassword error:", err);
    return {
      success: false,
      msg: "Error changing password"
    };
  }
};

export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long"
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Password cannot exceed 128 characters"
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter"
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter"
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number"
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character (!@#$%^&*...)"
    };
  }

  if (/\s/.test(password)) {
    return {
      isValid: false,
      message: "Password cannot contain spaces"
    };
  }

  return { isValid: true };
};

export const changePasswordAndLogout = async (
  data: ChangePasswordData
): Promise<ApiResponse<boolean>> => {
  try {
    const changeResult = await changePassword(data);
    
    if (!changeResult.success) {
      return changeResult;
    }

    return { 
      success: true, 
      data: true 
    };
  } catch (error) {
    const err = error as Error;
    console.error("changePasswordAndLogout error:", err);
    return {
      success: false,
      msg: "Error changing password"
    };
  }
};