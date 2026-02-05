import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db";
import * as schema from "../database/schema";
import { admin, openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      premium: {
        type: "boolean",
        input: false,
      },
    },
  },
  trustedOrigins: [process.env.CLIENT_URL!],
  plugins: [openAPI(), admin()],
  advanced: {
    database: {
      generateId: "uuid",
    },
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
