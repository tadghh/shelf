import { Inter } from "next/font/google";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import BookCover from "./book-cover";

const inter = Inter({ subsets: ["latin"] });

export default function BookDashboard({ localData }) {
	const [imageData, setImageData] = useState([]);
	const [titleData, setTitleData] = useState([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		async function loadImages() {
			const titles = await invoke("create_covers", {
				dir: "E:/Books/BookShare/DIYTEST",
			});
			setTitleData(titles);

			setImageData(titles);
			setLoaded(true);
		}

		loadImages();
	}, []);

	return (
		<div className="flex ml-20 min-h-screen gap-y-2.5 py-2  bg-white items-center justify-between flex-wrap">
			{loaded &&
				imageData.map((data, index) => (
					<BookCover
						className="py-4 "
						key={index}
						cover_path={`./cover_cache/${data.cover_location}`}
						title={titleData[index]?.title}
					/>
				))}
		</div>
	);
}
