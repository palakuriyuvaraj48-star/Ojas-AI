export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateProfile(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.age || (data.age as number) < 15 || (data.age as number) > 100) {
    errors.age = "Age must be between 15 and 100";
  }
  if (!data.height || (data.height as number) < 100 || (data.height as number) > 250) {
    errors.height = "Height must be between 100 and 250 cm";
  }
  if (!data.weight || (data.weight as number) < 30 || (data.weight as number) > 300) {
    errors.weight = "Weight must be between 30 and 300 kg";
  }
  if (!data.goal) {
    errors.goal = "Fitness goal is required";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAuthLogin(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};
  if (!validateEmail(email)) errors.email = "Valid email is required";
  if (!validatePassword(password)) errors.password = "Password must be at least 6 characters";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAuthRegister(name: string, email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Name is required";
  if (!validateEmail(email)) errors.email = "Valid email is required";
  if (!validatePassword(password)) errors.password = "Password must be at least 6 characters";
  return { valid: Object.keys(errors).length === 0, errors };
}
