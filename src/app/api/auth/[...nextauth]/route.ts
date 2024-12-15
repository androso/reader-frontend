import { validateEnv } from '@/lib/env';
import '../../../../lib/env' 
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					prompt: "select_account",
				},
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
