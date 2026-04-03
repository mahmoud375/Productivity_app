import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import {
  credentialsProvider,
  googleProvider,
  githubProvider,
} from "./providers";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [credentialsProvider, googleProvider, githubProvider],
});
