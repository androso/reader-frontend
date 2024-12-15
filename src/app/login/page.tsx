"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function Login() {
	const router = useRouter();

	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			console.log("user is logged in");
			router.push("/");
		} else {
			console.log("user is not logged in");
		}
	}, [isAuthenticated, isLoading]);

	if (isLoading) {
		return "...";
	}

	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md p-6">
				<h1 className="text-2xl font-semibold text-center mb-6">
					Login
				</h1>
				<Button
					onClick={() => signIn("google", { callbackUrl: "/" })}
					className="w-full"
					variant="outline"
				>
					Continue with Google
				</Button>
			</Card>
		</div>
	);
}
