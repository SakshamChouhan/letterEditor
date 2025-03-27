import NextAuth from "next-auth";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    accessToken: string;  // ✅ Now accessible as session.accessToken
    user: {
      id: string;
      email: string;
    };
  }

  interface Profile {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string; // ✅ Store accessToken in JWT
  }
}
