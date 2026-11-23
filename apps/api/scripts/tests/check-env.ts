import dotenv from "dotenv";

// Загрузка .env
dotenv.config();

console.log("📦 Environment check:");
console.log(`  ADMIN_EMAIL=${process.env.ADMIN_EMAIL || '(empty)'}`);
console.log(`  ADMIN_PASSWORD exists: ${!!process.env.ADMIN_PASSWORD}`);