import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10), // Default to 5000 if PORT not set

  database: {
    url: process.env.DATABASE_URL || "", // Default to empty string if not set
  },

  ldap: {
    url: process.env.LDAP_URL || "", // Default to empty string
    bindDN: process.env.LDAP_BIND_DN || "", // Default to empty string
    bindPassword: process.env.LDAP_BIND_PASSWORD || "", // Default to empty string
    searchBase: process.env.LDAP_BASE_DN || "", // Default to empty string
  },
};

// --- Optional: Basic Check for Critical Variables ---
// You might still want a simple check for absolutely essential variables
// to prevent the app from running in a broken state.
if (!config.database.url) {
  console.error(
    "❌ FATAL ERROR: DATABASE_URL is not defined in the environment variables."
  );
  process.exit(1);
}
if (!config.ldap.url) {
  console.error(
    "❌ FATAL ERROR: LDAP_URL is not defined in the environment variables."
  );
  process.exit(1);
}
// Add checks for other critical variables like LDAP_BIND_DN/Password if they are always required.

// Log only non-sensitive parts
console.log("✅ Configuration Loaded (Simplified):");
console.log(`   Port: ${config.port}`);
console.log(`   LDAP URL: ${config.ldap.url}`);

// Export as default or named export as preferred
export default config;
