/**
 * Şifre validasyonu yardımcı fonksiyonları
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ["Şifre boş olamaz."],
      strength: "weak",
    };
  }

  if (password.length < 8) {
    errors.push("Şifre en az 8 karakter olmalıdır.");
  } else {
    score += 1;
  }

  if (password.length > 128) {
    errors.push("Şifre en fazla 128 karakter olabilir.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("En az bir büyük harf içermelidir.");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("En az bir küçük harf içermelidir.");
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push("En az bir rakam içermelidir.");
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("En az bir özel karakter içermelidir (!@#$%^&*(),.?\":{}|<>).");
  } else {
    score += 1;
  }

  // Güçlülük hesaplama
  if (score >= 4 && password.length >= 12) {
    strength = "strong";
  } else if (score >= 3) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export function getPasswordStrengthColor(strength: "weak" | "medium" | "strong"): string {
  switch (strength) {
    case "strong":
      return "green";
    case "medium":
      return "yellow";
    case "weak":
      return "red";
    default:
      return "gray";
  }
}

