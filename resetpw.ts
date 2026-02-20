// resetpw.ts
import { loadEnvConfig } from '@next/env';
// This loads the .env variables natively
loadEnvConfig(process.cwd());

async function resetPassword() {
  const emailToReset = 'emmanuel.haankwenda2018@gmail.com';
  const newPassword = 'Password123!';

  console.log(`Starting password reset for ${emailToReset}...`);

  try {
    // Dynamically retrieve these AFTER checking configuration
    const { db } = await import('./src/db');
    const { users, accounts } = await import('./src/db/schema');
    const { eq } = await import('drizzle-orm');
    const bcrypt = await import('bcrypt');

    if (!db) {
      throw new Error("Cannot connect to Database. DATABASE_URL is somehow empty.");
    }

    // 1. Find user by email
    const userList = await db.select().from(users).where(eq(users.email, emailToReset));

    if (userList.length === 0) {
      console.log(`❌ No user found with email ${emailToReset}`);
      process.exit(1);
    }

    const user = userList[0];
    console.log(`✅ Found user with ID ${user.id}`);

    // 2. Hash new password
    // Better auth uses bcrypt by default
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`✅ Hashed new password successfully.`);

    // 3. Update account record
    // Look for the credential account
    const accountList = await db.select().from(accounts).where(eq(accounts.userId, user.id));

    if (accountList.length === 0) {
      console.log(`❌ No accounts found for user. Cannot reset password.`);
      process.exit(1);
    }

    const credentialAccount = accountList.find((acc: any) => acc.providerId === 'credential');

    if (!credentialAccount) {
      console.log(`❌ No credential account found. Did you sign up with Google?`);
      process.exit(1);
    }

    // Update password
    await db.update(accounts)
      .set({ password: hashedPassword })
      .where(eq(accounts.id, credentialAccount.id));

    console.log(`\n🎉 Password successfully reset for ${emailToReset}`);
    console.log(`Your new explicit password is: ${newPassword}`);
    console.log(`Please login at http://localhost:3000/signin and update it later.`);
    process.exit(0);

  } catch (err) {
    console.error(`❌ Error resetting password:`, err);
    process.exit(1);
  }
}

resetPassword();
