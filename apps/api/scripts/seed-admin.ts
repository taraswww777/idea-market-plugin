import prisma from "../src/db.js";
import { hashPassword } from "../src/services/password.service.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";

/**
 * Создаёт или обновляет администратора. Идемпотентен.
 * Пароль хэшируется, роль ADMIN устанавливается явно.
 */
export async function seedAdmin(): Promise<void> {
  console.log("📦 Admin seeding started...");

  const targetEmail = ADMIN_EMAIL;
  console.log(`🔐 Creating/verifying admin user: ${targetEmail}`);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: targetEmail } });

    if (existingUser) {
      console.log(`✅ Admin already exists: ${targetEmail} (ID: ${existingUser.id})`);
      console.log("   Script is idempotent — no changes made");
      return;
    }

    // Create new admin user with hashed password and ADMIN role
    const newUser = await prisma.user.create({
      data: {
        email: targetEmail,
        passwordHash: await hashPassword(ADMIN_PASSWORD),
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log(`✅ Created new admin user:`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ADMIN`);
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    throw error;
  }
}

// Run when executed directly (not imported as side effect)
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await seedAdmin();
      console.log("\n✅ Admin seeding completed successfully");
      process.exit(0);
    } catch (err) {
      console.error("\n❌ Admin seeding failed:", err.message);
      process.exit(1);
    }
  })();
}

export default seedAdmin;