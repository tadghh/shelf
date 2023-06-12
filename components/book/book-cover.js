import Image from "next/image";
import Link from "next/link";



export default function BookCover({ title, coverPath }) {
	const bookLink = `./books/${title}`;
	return (
		<div className=" duration-350 h-[500px] w-[300px] rounded-lg bg-white p-6 pb-8 pt-10 text-black shadow-xl ring-1 ring-gray-900/5 transition ease-in-out hover:bg-black hover:text-white ">
			<div className="flex h-full flex-col justify-between">
				<Image
					className="duration-550 rounded-lg border-white transition ease-in-out hover:border-4 "
					alt={title}
					width={300}
					height={500}
					src={coverPath}
				/>

				<div className="max-w-xs pt-8 font-semibold ">
					<p>
						<Link href={bookLink}>{title}</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
