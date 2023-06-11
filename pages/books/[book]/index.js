import {invoke} from "@tauri-apps/api/tauri";
import {useRouter} from "next/router";
import {useState, useEffect, useRef} from "react";
import ePub from "epubjs";

export default function Book() {
	const router = useRouter();
	const {book} = router.query;
	const bookRef = useRef(null);
	const [bookData, setBookData] = useState("");
	const [bookError, setBookError] = useState(false);
	const [bookOpen, setBookOpen] = useState(false);
	const [bookRender, setBookRender] = useState();

	useEffect(() => {
		async function loadBook() {
			if (book !== undefined && !bookOpen) {
				setBookData(
					await invoke("load_book", {
						title: book,
					})
				);

				const bookLoaded = ePub({
					encoding: "base64",
				});

				if (bookData.length != 0 && !bookLoaded.isOpen) {
					bookRef.current = bookLoaded;

					bookLoaded.open(bookData);

					try {
						bookLoaded.ready.then(() => {
							const rendition = bookLoaded.renderTo(
								document.getElementById("viewer"),
								{
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
	return (
		<div className="flex ml-20 min-h-screen flex-col items-center	 justify-items-center	">
			<h1 className="text-black">{book}</h1>
			{bookError ? (
				<div>
					<h3>Book failed to load</h3>
				</div>
			) : (
				<div className="flex flex-col border-2 border-orange-700	rounded-lg w-[25rem]	h-[35rem]	">
					<div id="viewer" style={{width: "100%", height: "100%"}} />
					<div id="controls" className="flex justify-between">
						<button
							onClick={() => bookRender.prev()}
							type="button"
							className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
						>
							Previous
						</button>
						<button
							onClick={() => bookRender.next()}
							type="button"
							className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
