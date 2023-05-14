import Image from "next/image";

export default function BookItem({ book_path }) {
	return (
		<div class=" bg-white p-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 rounded-lg h-[500px] w-[300px] transition ease-in-out duration-350 text-black hover:text-white hover:bg-black "></div>
	);
}
