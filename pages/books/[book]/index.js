import Image from "next/image";
import { Inter } from "next/font/google";
import BookDashboard from "@/components/book/dashboard";
import BookItem from "@/components/book/book-item";

const inter = Inter({ subsets: ["latin"] });
import { useRouter } from "next/router";

export default function Book() {
	const router = useRouter();
	const { book } = router.query;
	//href of book will be id as number in the json
	//invoke method in rust to find the books location and return the path
	//pass path to BookItem

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
