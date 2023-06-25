import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import ePub from "epubjs";

export default function Book() {


	const router = useRouter();
	const { book } = router.query;
	const bookRef = useRef(null);
	const [bookData, setBookData] = useState("");
	const [bookError, setBookError] = useState(false);
	const [bookOpen, setBookOpen] = useState(false);
	const [bookRender, setBookRender] = useState();
	const [scrollStyle, setScrollStyle] = useState();
	const [maxHeight, setMaxHeight] = useState();
	const [maxWidth, setMaxWidth] = useState();

	useEffect(() => {
		async function loadBook() {
			if (book !== undefined && !bookOpen) {
				setBookData(await invoke("load_book", { title: book }));

				const bookLoaded = ePub({
					encoding: "base64",
				});

				if (bookData.length !== 0 && !bookLoaded.isOpen) {
					bookRef.current = bookLoaded;
					bookLoaded.open(bookData);

					try {
						bookLoaded.ready.then(() => {
							const type = scrollStyle ? "default" : "continuous";
							const rendition = bookLoaded.renderTo(
								document.getElementById("viewer"),
								{
									manager: "continuous",
									flow: "scrolled",
									width: "100%",
									height: "100%",
								}
							);

							setBookRender(rendition);
							rendition.display();
						});
					} catch {
						setBookError(true);
					}

					setBookOpen(true);
				}
			}
		}

		loadBook();
	}, [book, bookRef, bookData, bookOpen, scrollStyle]);

	useEffect(() => {

		if (typeof window !== "undefined") {
			import("@tauri-apps/api/window").then((module) => {
				const { appWindow } = module;
				appWindow.setTitle(book);
			});
		}
		router.events.on('routeChangeStart', () => {
			if (typeof window !== "undefined") {
				import("@tauri-apps/api/window").then((module) => {
					const { appWindow } = module;
					appWindow.setTitle("Shelf");
				});
			}
		});
		function handleResize() {
			setMaxHeight(window.innerHeight);
			setMaxWidth(window.innerWidth);
		}

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [book]);

	return (
		<div className="flex flex-col items-center max-h-screen ml-20 overflow-hidden justify-items-center ">

			<h1 className="mt-5 text-black">{book}</h1>
			{bookError ? (
				<div>
					<h3>Book failed to load</h3>
				</div>
			) : (



				<div id="viewer" className=" overflow-hidden border-2 border-orange-700 mb-20 rounded-lg w-10/12 h-[1800px]" style={{ maxHeight: `${maxHeight}px`, maxWidth: `${maxWidth}px` }} />


			)}

		</div>
	);
}
