"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { Icon } from "@iconify/react";
import { deleteBook } from "@/actions/bookActions";
import toast from "react-hot-toast";

export default function Page() {
	const router = useRouter();
	const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
	const { isAuthenticated, isLoading, user } = useAuth();
	const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);
	
	useEffect(() => {
		if (isAuthenticated) {
			fetch('/api/books')
				.then(res => res.json())
				.then(data => {
					console.log({data})
					setBooks(data.books)				
				})
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

	const deleteItem = async (e: any, itemId: string) => {
		e.stopPropagation();
		const result = await deleteBook(itemId);
		if (result.success) {
			toast.success(result.message);
		} else {
			toast.error(result.message)
		}
	}
	
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
						<Card
							key={book.id} 
							className="relative transition-colors hover:bg-slate-200 p-5 cursor-pointer" 
							onClick={() => router.push(`/read/${book.fileKey}`)}
							onMouseEnter = { () => setHoveredBookId(book.id) }
							onMouseLeave={()  => setHoveredBookId(null)}
							>
							<h3 className="font-medium">{book.title}</h3>
							<div 
								className={`transition-opacity absolute right-4 top-1/2 transform -translate-y-1/2 bg-slate-900 py-2 px-2 rounded-full text-white hover:text-red-400 ${hoveredBookId === book.id ? 'opacity-100' : 'opacity-0'}`}
								onClick={(e) => deleteItem(e, book.id)}	
								>
								<Icon icon="solar:archive-bold" width="16" height="16"/>
							</div>
						</Card>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
