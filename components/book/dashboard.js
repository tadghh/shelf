import { Inter } from "next/font/google";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import BookCover from "./book-cover";

const inter = Inter({ subsets: ["latin"] });

export default function BookDashboard() {
	const [coverData, setCoverData] = useState([]);

	useEffect(() => {
		function loadCovers() {
			invoke("create_covers", {
				dir: "E:/Books/BookShare/DIYTEST",
			}).then((data) => {
				setCoverData(data);
			});
		}

		loadCovers();
	}, []);
	console.log(coverData);
	return (
		<div className="flex ml-20 min-h-screen gap-y-2.5 py-2  bg-white items-center justify-between flex-wrap">
			{coverData &&
				coverData.map((data, index) => (
					<BookCover
						className="py-4 "
						key={index}
						cover_path={`./cover_cache/${data.cover_location}`}
						title={data.title}
					/>
				))}
		</div>
	);
}
