/**
 * Скрипт для создания администратора из env переменных
 * Идемпотентен - создаст только если пользователя с таким email не существует
 */
export async function seedAdmin(): Promise<void> {
  console.log("📦 Debug: Starting admin seeding...");
  console.log("📦 Debug: process.cwd() =", process.cwd());
  console.log("📦 Debug: Checking for .env file at: ./scripts/.env from scripts dir or root .env");
  
  // Пробуем несколько путей
  let result: any;
  try {
    // Сначала пробуем относительный путь
    result = dotenv.config({ path: './.env', override: true });
  } catch (e) {
    console.warn("⚠️  Could not load ./env, trying root .env");
    result = dotenv.config({ path: '../../.env', override: true });
  }
  
  console.log(`✅ dotenv config result: injected ${result.parsed ? Object.keys(result.parsed).length : 0} env vars`);

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";

  console.log(`🔐 Debug: ADMIN_EMAIL=${ADMIN_EMAIL}`);
  console.log(`🔐 Debug: ADMIN_PASSWORD exists=${!!ADMIN_PASSWORD}`);
  console.log(`🔐 Debug: ADMIN_TOKEN exists=${!!process.env.ADMIN_TOKEN}`);

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables. Skipping admin seeding.");
    return;
  }

  console.log(`\n🔐 Seeding admin user: ${ADMIN_EMAIL}`);

  try {
    const token = process.env.ADMIN_TOKEN;
    let decoded: UserClaims | null = null;

    if (token) {
      console.log(`🔑 Debug: Checking admin token...`);
      try {
        decoded = await verifyToken(token, JWT_SECRET);
        console.log("✅ Admin token provided, using email from token:", decoded?.email);
      } catch (err: any) {
        console.warn(`⚠️  Invalid admin token, will use ADMIN_EMAIL env var`);
      }
    }

    const targetEmail = decoded?.email || ADMIN_EMAIL;
    console.log(`\n📧 Debug: Target email to create: ${targetEmail}`);

    const prisma = new PrismaClient();
    console.log("🔍 Debug: Checking if user exists...");
    
    const existingUser = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (existingUser) {
      console.log(`✅ Admin already exists: ${targetEmail} (ID: ${existingUser.id})`);
      console.log("   Script is idempotent - no changes made");
      return;
    }

    const userId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    console.log(`\n📝 Debug: Creating new admin user...`);
    
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: targetEmail,
        password: ADMIN_PASSWORD,
        name: "Admin",
      },
    });

    console.log(`✅ Created new admin user:`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ADMIN (default role will be set via JWT token)`);

  } catch (error: any) {
    console.error("❌ Error seeding admin:", error.message);
    throw error;
  } finally {
    // Cleanup not needed for singleton pattern
  }
}

// Запуск скрипта при прямом выполнении
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await seedAdmin();
      console.log("\n✅ Admin seeding completed successfully");
      process.exit(0);
    } catch (err: any) {
      console.error("\n❌ Admin seeding failed:", err.message);
      process.exit(1);
    }
  })();
}


  // Запускаем функцию сразу при загрузке модуля (для npm run)
  if (!process.env.__SKIP_SEED_ADMIN__) {
    await seedAdmin();
  }

  export default seedAdmin;