import '../../../../lib/env' 
import NextAuth, { type NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByGoogleId, createUserFromGoogle } from "@/actions/userActions";

export const authOptions: NextAuthOptions = {
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
	callbacks: {
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub!;
			}
			return session;
		},
		async signIn({ user, account}) {
			if (account?.provider === "google") {
				// check if it already exists
				const existingUser = await getUserByGoogleId(account.providerAccountId);

				// if it doesn't, then create it
				if (!existingUser) {
					await createUserFromGoogle({
						email: user.email!,
						googleId: account.providerAccountId,
						name: user.name!,
						image: user.image!
					})
				}
				// otherwise just continue
			}
			return true;
		}
	}
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
