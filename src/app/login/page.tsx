"use client";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGoogleSignIn, useUser } from "@/lib/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function Login() {
	const router = useRouter();
	const { data: userData, isSuccess, isPending, error, isError } = useUser();
	const { mutate: signIn, isPending: googlePending, data } = useGoogleSignIn();

	useEffect(() => {
		if (data?.user || userData) {
			console.log("user is logged in");
			router.push("/");
		}
	}, [userData, data]);

	const login = useGoogleLogin({
		onSuccess: (codeResponse) => {
			signIn(codeResponse.access_token);
		},
		onError: (error) => {
			console.error("Login Failed:", error);
		},
	});

	// Show loading state while redirecting
	if (userData || data?.user || googlePending) {
		return (
			<div className="h-screen flex items-center justify-center">
				<p>...</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md p-6">
				<h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
				<GoogleSignInButton onClick={() => login()} isLoading={googlePending} />
			</Card>
		</div>
	);
}
