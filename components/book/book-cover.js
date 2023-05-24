import Image from "next/image";
import Link from "next/link";
export default function BookCover({ title, cover_path }) {
	const bookLink = `./books/${title}`;
	return (
		<div className=" bg-white p-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 rounded-lg h-[500px] w-[300px] transition ease-in-out duration-350 text-black hover:text-white hover:bg-black ">
			<div className="flex flex-col justify-between h-full">
				<Image
					className="transition ease-in-out duration-550 rounded-lg hover:border-4 border-white "
					alt={title}
					width={300}
					height={500}
					src={cover_path}
				/>

				<div className="pt-8 max-w-xs font-semibold ">
					<p>
						<Link href={bookLink}>{title}</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
