import Image from "next/image";
import Link from "next/link";



export default function BookCover({ title, coverPath }) {
	const bookLink = `./books/${title}`;
	return (
		<div className=" duration-350 h-[500px] w-[300px] rounded-lg bg-white p-6 pb-8 pt-10 text-black shadow-xl ring-1 ring-gray-900/5 transition ease-in-out hover:bg-black hover:text-white ">
			<div className="flex h-full flex-col justify-between">
				<div className="flex max-w-fit max-h-fit justify-center overflow-hidden rounded-lg">
					<Image
						className="duration-550  border-white transition ease-in-out hover:border-4 "
						alt={title}
						width={300}
						quality={100}
						object-fit="cover"
						height={500}
						src={coverPath}
					/>
				</div>


				<div className="max-w-xs pt-8 font-semibold ">
					<p>
						<Link href={bookLink}>{title}</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
