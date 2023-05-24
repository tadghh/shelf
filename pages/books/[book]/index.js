import { Inter } from "next/font/google";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Book() {
	const router = useRouter();
	const { book } = router.query;
	//href of book will be id as number in the json
	//invoke method in rust to find the books location and return the path
	//pass path to BookItem
	const [bookO, setBookO] = useState(String);
	useEffect(() => {
		async function loadBook() {
			if (book !== undefined) {
				console.log(book);
				const titles = await invoke("load_book", {
					title: book,
				});
				setBookO(titles);

				const temp = await Promise.all(console.log(bookO));
				console.log("loaded");
			}
		}

		loadBook();
	}, [book]);
	//unhash book
	//load book?
	//profit?
	return (
		<div className="flex ml-20 min-h-screen flex-col items-center	 justify-items-center	">
			<h1 className="text-black">{book}</h1>
			<div className="border-2 border-orange-700	rounded-lg w-[25rem]	h-[35rem]	"></div>
		</div>
	);
}
