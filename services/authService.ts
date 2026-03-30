import { supabase } from "../lib/supabase";
import { ApiResponse } from "./types";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  email: string;
}

export interface VerifyPasswordData {
  email: string;
  password: string;
}

export interface PasswordRule {
  key: string;
  label: string;
  passed: boolean;
}

export interface PasswordStrengthResult {
  isValid: boolean;
  rules: PasswordRule[];
  score: number;
  strength: "none" | "weak" | "fair" | "strong" | "very_strong";
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
      const failingRules = passwordValidation.rules.filter(r => !r.passed);
      return {
        success: false,
        msg: failingRules.map(r => r.label).join(", "),
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

export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  const rules: PasswordRule[] = [
    {
      key: "minLength",
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      key: "maxLength",
      label: "No more than 128 characters",
      passed: password.length <= 128,
    },
    {
      key: "lowercase",
      label: "One lowercase letter",
      passed: /[a-z]/.test(password),
    },
    {
      key: "uppercase",
      label: "One uppercase letter",
      passed: /[A-Z]/.test(password),
    },
    {
      key: "number",
      label: "One number",
      passed: /\d/.test(password),
    },
    {
      key: "special",
      label: "One special character (!@#$%...)",
      passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
    {
      key: "noSpaces",
      label: "No spaces",
      passed: !/\s/.test(password),
    },
  ];

  const score = rules.filter((r) => r.passed).length;
  const isValid = rules.every((r) => r.passed);

  let strength: PasswordStrengthResult["strength"] = "none";
  if (score >= 7) strength = "very_strong";
  else if (score >= 5) strength = "strong";
  else if (score >= 3) strength = "fair";
  else if (score >= 1) strength = "weak";

  return { isValid, rules, score, strength };
};

export const sendPasswordResetEmail = async (
  email: string
): Promise<ApiResponse<null>> => {
  try {
    const redirectTo = Linking.createURL("reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) return { success: false, msg: error.message };
    return { success: true, data: null };
  } catch (err) {
    return { success: false, msg: (err as Error).message };
  }
};

export const signInWithGoogle = async (): Promise<ApiResponse<null>> => {
  try {
    const redirectUrl = Linking.createURL("/auth/callback");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { success: false, msg: error.message };
    if (!data.url) return { success: false, msg: "No auth URL received" };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === "success") {
      const urlParams = new URL(result.url).searchParams;
      const code = urlParams.get("code");
      if (code) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) return { success: false, msg: sessionError.message };
        return { success: true, data: null };
      }
    }

    return { success: false, msg: "Authentication cancelled or failed" };
  } catch (err) {
    return { success: false, msg: (err as Error).message };
  }
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