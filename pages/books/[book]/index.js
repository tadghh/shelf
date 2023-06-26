/* eslint-disable camelcase */
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
	const [scrollStyle, setScrollStyle] = useState("false");
	const [maxHeight, setMaxHeight] = useState();
	const [maxWidth, setMaxWidth] = useState();
	const [backgroundData, setBackgroundData] = useState();

	useEffect(() => {
		async function loadBook() {
			if (book !== undefined && !bookOpen) {
				const bookData = await invoke("load_book", { title: book });

				setBookData(bookData);

				const bookLoaded = ePub({
					encoding: "base64",
				});

				if (bookData.length !== 0 && !bookLoaded.isOpen) {
					let endlessScrollValue;
					bookRef.current = bookLoaded;
					bookLoaded.open(bookData);
					invoke("get_cover", { book_title: book }).then((data) => {
						setBackgroundData(data);
					});
					invoke("get_configuration_option", {
						option_name: "endless_scroll",
					}).then(data => {
						if (data) {
							endlessScrollValue = data;

							setScrollStyle(endlessScrollValue === "true");
						}
					});

					try {
						bookLoaded.ready.then(() => {
							//I dont like this null here but nmp atm

							const rendition = bookLoaded.renderTo(
								document.getElementById("viewer"),
								{
									manager: endlessScrollValue === "true" ? "continuous" : "default",
									flow: endlessScrollValue === "true" ? "scrolled" : null,
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
	}, [book, bookRef, bookData, bookOpen]);

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
	}, [book, router.events]);

	return (
		<div className="flex flex-col items-center max-h-screen ml-20 overflow-hidden justify-items-center bg-slate-600 ">
			{bookError ? (
				<div>
					<h3>Book failed to load</h3>
				</div>
			) : (
				/*Making the element bigger than visable so more content is loaded and the scroll bar doesnt bottom out as easily*/
				<div id="viewer" className=" overflow-hidden border-2 border-orange-700 my-10 rounded-lg w-10/12 h-[1800px]" style={{ maxHeight: `${maxHeight}px`, maxWidth: `${maxWidth}px`, backgroundImage: `url('data:image/jpeg;base64,${backgroundData}')` }} >

					{scrollStyle ? null :
						<div id="controls" className="flex justify-between">
							<button
								onClick={() => bookRender.prev()}
								type="button"
								className="px-2 py-1 text-xs font-semibold text-gray-900 bg-white rounded shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							>
								Previous
							</button>
							<button
								onClick={() => bookRender.next()}
								type="button"
								className="px-2 py-1 text-xs font-semibold text-gray-900 bg-white rounded shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							>
								Next
							</button>
						</div>
					}

				</div>
			)}

		</div>
	);
}
