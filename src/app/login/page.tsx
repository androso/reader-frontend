"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

import { signIn, useSession } from 'next-auth/react';

export default function Login() {
	console.log("hello from login");
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const { data: session } = useSession();

	if (isAuthenticated) {
		router.push("/");
		return null;
	}

	const handleGoogleLogin = () => {
		window.location.href = "/auth/google";
	};

	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md p-6">
				<h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
				<Button
					onClick={() => signIn("google", { callbackUrl: '/' })}
					className="w-full"
					variant="outline"
				>
					Continue with Google
				</Button>
			</Card>
		</div>
	);
}