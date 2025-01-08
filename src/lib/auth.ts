import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export interface User {
	id: string;
	displayName: string;
	email?: string;
	provider: string;
}

export function useUser() {
	const [hasToken, setHasToken] = useState(false);

	useEffect(() => {
		if (localStorage.getItem("token")) {
			setHasToken(true);
		}
	}, []);
	
	return useQuery({
		queryKey: [`${process.env.NEXT_PUBLIC_API_URL}/api/user`],
		queryFn: async () => {
			const token = localStorage.getItem("token");
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		enabled: hasToken,
		retry: false,
	});
}

export function useGoogleSignIn() {
	return useMutation({
		mutationFn: async (token: string) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});

			if (!res.ok) {
				throw new Error("Authentication failed");
			}

			const data = await res.json();
			localStorage.setItem("token", data.token);
			console.log({data})
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [`${process.env.NEXT_PUBLIC_API_URL}/api/user`],
			});
		},
	});
}

export function signOut() {
	localStorage.removeItem("token");
	queryClient.invalidateQueries({
		queryKey: [`${process.env.NEXT_PUBLIC_API_URL}/api/user`],
	});
}