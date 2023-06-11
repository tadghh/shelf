import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import BookCover from "./book-cover";
import Link from "next/link";

export default function BookDashboard() {
	const [coverData, setCoverData] = useState( [] );

	useEffect( () => {
		function loadCovers() {
			invoke( "create_covers" ).then( ( data ) => {
				console.log( data );
				console.log( "cover method" );
				setCoverData( data );
			} );
		}

		loadCovers();
	}, [] );
	console.log( coverData );
	console.log( "is null" );
	//Finish making button to goto settings
	return (
		<>
			{( coverData && (
				<div className="flex ml-20 min-h-screen gap-y-2.5 py-2  bg-white items-center justify-between flex-wrap">
					{coverData.map( ( data, index ) => (
						<BookCover
							className="py-4 "
							key={index}
							coverPath={`./cover_cache/${data.cover_location}`}
							title={data.title}
						/>
					) )}
				</div>
			) ) || (
				<div className="flex ml-20 min-h-screen bg-white ">
					<div className="flex-grow flex items-center justify-center">
						<div className="w-80 h-4/5 bg-gray-200 text-black rounded-md flex-col items-center  justify-center">
							<div className="px-4 text-center">
								Please configure your shelf directory:
							</div>
							<div className="px-4 text-center ">
								<Link className="items-center  text-blue-500" href="/settings">
									Here
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
