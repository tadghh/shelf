import { Inter } from "next/font/google";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import ePub from "epubjs";

const inter = Inter({ subsets: ["latin"] });

export default function Book() {
	const router = useRouter();
	const { book } = router.query;
	const bookRef = useRef(null);
	const [bookO, setBookO] = useState(String);
	const [bookData, setBookData] = useState("");
	useEffect(() => {
		async function loadBook() {
			if (book !== undefined) {
				console.log(book);

				setBookData(
					await invoke("load_book", {
						title: book,
					})
				);
				//setBookO(titles);
				console.log(bookData.length);
				const book_loaded = ePub({
					encoding: "base64",
				});
				// Update with the path or URL to your EPUB file
				bookRef.current = book_loaded;
				book_loaded.open(bookData);
				try {
					console.log("sss");

					console.log(book_loaded.ready);
					await book_loaded.ready;
					if (await book_loaded.ready) {
						console.log("yoddddd");

						const viewerElement = document.getElementById("viewer");
						const rendition = await book_loaded.renderTo(viewerElement, {
							width: "100%",
							height: "100%",
						});
						rendition.display();
					}
					console.log("yo");
				} catch (error) {
					console.error(error);
				}
				console.log(bookO);
				console.log("loaded");
			}
		}

		loadBook();
	}, [book, bookRef]);

	return (
		<div className="flex ml-20 min-h-screen flex-col items-center	 justify-items-center	">
			<h1 className="text-black">{book}</h1>
			<div className="border-2 border-orange-700	rounded-lg w-[25rem]	h-[35rem]	">
				<div id="viewer" style={{ width: "100%", height: "100%" }} />
			</div>
		</div>
	);
}
