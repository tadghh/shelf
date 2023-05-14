import Image from "next/image";

export default function BookCover({ title, cover_path }) {
	return (
		<div class=" bg-white p-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 rounded-lg h-[500px] w-[300px] transition ease-in-out duration-350 text-black hover:text-white hover:bg-black ">
			<div class="flex flex-col justify-between h-full">
				<Image
					className="transition ease-in-out duration-550 rounded-lg hover:border-4 border-white "
					alt={title}
					width={300}
					height={500}
					src={cover_path}
				/>

				<div className="pt-8 max-w-xs font-semibold ">
					<p>
						<a>{title}</a>
					</p>
				</div>
			</div>
		</div>
	);
}
