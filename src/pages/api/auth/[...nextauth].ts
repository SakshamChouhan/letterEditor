import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents", 
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token || ""; // ✅ Store accessToken in JWT
        token.id = profile?.id || ""; // Store user ID
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user is properly initialized and has the 'id' field
      session.accessToken = token.accessToken || ""; // Store accessToken at root level
      session.user = {
        id: token.id || "", // Ensure user ID is included
        email: session.user.email || "", // Ensure email is defined in the session
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

