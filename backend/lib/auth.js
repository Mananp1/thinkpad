import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Better Auth needs a connected driver-level Db. Mongoose owns its own pool for
// the Note model, so auth gets a small dedicated client against the same
// database rather than depending on mongoose's connect order.
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

export const auth = betterAuth({
  // Passing `client` here would opt into MongoDB transactions, which only work
  // on a replica set or mongos - a standalone mongod (the usual local setup)
  // errors on every write. Left off so the app runs anywhere.
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
});
