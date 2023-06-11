import { Cog8ToothIcon, HomeIcon, StarIcon } from "@heroicons/react/24/outline";

const navigation = [
	{ name: "Books", href: "/books", icon: HomeIcon },
	{ name: "Settings", href: "/settings", icon: Cog8ToothIcon },
	{ name: "Favourites", href: "#", icon: StarIcon },
];

export default function MainNavigation( { children = null } ) {
	return (
		<>
			<div>
				<div className="transition-width duration-500  ease-in-out   fixed inset-y-0 z-50 flex w-16  hover:w-60 flex-col">
					<div className="flex  rounded-r-lg text-transparent transition-colors  hover:duration-700 duration-300 ease-in-out hover:text-white grow flex-col gap-y-5 bg-gray-900 px-5">
						<nav className="pt-8 flex flex-1 flex-col ">
							<ul role="list">
								{navigation.map( ( item ) => (
									<li key={item.name} className="flex ">
										<item.icon
											className=" w-6 text-white shrink-0"
											aria-hidden="true"
										/>
										<a
											href={item.href}
											className="text-inherit hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
										>
											{item.name}
										</a>
									</li>
								) )}
							</ul>
						</nav>
					</div>
				</div>

				<main className="bg-white">{children}</main>
			</div>
		</>
	);
}
