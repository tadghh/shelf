/* eslint-disable camelcase */
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import BookCover from "./book-cover";
import Link from "next/link";

export default function BookDashboard() {
	const [imageData, setImageData] = useState([]);
	const [titleData, setTitleData] = useState([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		async function loadImages() {
			const bookCovers = await invoke("create_covers");
			setTitleData(bookCovers);

			const base64ImageAddresses = await Promise.all(
				bookCovers.map(async (book) => {
					return await invoke("base64_encode_file", {
						file_path: book.cover_location,
					});
				})
			);
			setImageData(base64ImageAddresses);
			setLoaded(true);
		}

		loadImages();
	}, []);


	//Finish making button to goto settings
	return (
		<>
			{(loaded && (
				<div className="ml-20 flex min-h-screen flex-wrap items-center  justify-between gap-y-2.5 bg-white py-2">
					{imageData.map((data, index) => (
						<BookCover
							className="py-4 "
							key={index}
							coverPath={`data:image/jpeg;base64,${data}`}
							title={titleData[index]?.title}
						/>
					))}

				</div>
			)) || (
					<div className="ml-20 flex min-h-screen justify-center   bg-white">
						<div className=" flex  items-center">
							<div className="flex h-4/5 w-80 flex-col justify-around  rounded-md bg-gray-300 text-black  ">
								<div className="flex flex-col items-center justify-center ">
									<div className="m-2 rounded-md bg-gray-400 px-4 py-4 text-center">
										Please configure your book directory:
									</div>
									<div className="flex flex-col  items-center justify-center  ">
										<Link
											className="text-black-500  flex h-12 w-20 items-center  justify-center rounded-md  bg-white  underline"
											href="/settings"
										>
											Here
										</Link>
									</div>
								</div>
								<div className="m-2 flex  items-center  justify-center border-b-2 border-white  pb-5  "></div>
								<div className="flex items-center  justify-center pb-5     ">
									<div className="text-black-500 flex h-52 w-52   items-center justify-center rounded-md  border-4 border-dashed    border-white">
										Drop a .epub file here
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
		</>
	);
}
