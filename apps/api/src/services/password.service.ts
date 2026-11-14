import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Хеширует пароль с использованием bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Проверяет пароль против хеша
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw new Error("Failed to verify password");
  }
}

/**
 * Проверка хеша на валидность
 */
export async function isValidHash(hash: string): Promise<boolean> {
  try {
    return await bcrypt.hash("test", 1).then((newHash) => hash.startsWith("$2"));
  } catch (error) {
    console.error("Error checking hash validity:", error);
    throw new Error("Failed to check hash validity");
  }
}
