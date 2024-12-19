"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";

export default function Page() {
	const router = useRouter();
	const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
	const { isAuthenticated, isLoading, user } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			fetch('/api/books')
				.then(res => res.json())
				.then(data => setBooks(data.books))
				.catch(err => console.error('Error fetching books:', err));
		}
	}, [isAuthenticated]);
	
	const handleFileUpload = async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/books", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to upload file");
		}

		const data = await response.json();
		setBooks([...books, { id: data.id, title: file.name }]);
	};

	useEffect(() => {
		if (isLoading == false) {
			if (isAuthenticated == false) {
				router.push("/login");
			}
			console.log({isLoading, isAuthenticated})
		} else {
			console.log("loading", {isLoading, isAuthenticated})
		}
	}, [isAuthenticated, isLoading]);


	if (isLoading) {
		return  "...";	
	} 

	if (!isAuthenticated) {
		return null;
	}
	
	return (
		<div className="container mx-auto p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-semibold">Library</h1>
				<FileUpload onUpload={handleFileUpload} />
			</div>

			<ScrollArea className="h-[calc(100vh-12rem)]">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{books.map((book) => (
						<Card key={book.id} className="p-4">
							<h3 className="font-medium mb-2">{book.title}</h3>
							<Button
								onClick={() => router.push(`/read/${book.id}`)}
								variant="outline"
							>
								Read
							</Button>
						</Card>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
