import { Cog8ToothIcon, HomeIcon, StarIcon } from "@heroicons/react/24/outline";

const navigation = [
	{ name: "Books", href: "/books", icon: HomeIcon },
	{ name: "Settings", href: "/settings", icon: Cog8ToothIcon },
	{ name: "Favourites", href: "#", icon: StarIcon },
];

export default function MainNavigation({ children = null }) {
	return (
		<>
			<div>
				<div className="fixed inset-y-0 z-50 flex flex-col w-16 duration-500 ease-in-out transition-width hover:w-60">
					<div className="flex flex-col px-5 text-transparent transition-colors duration-300 ease-in-out bg-gray-900 rounded-r-lg hover:duration-700 hover:text-white grow gap-y-5">
						<nav className="flex flex-col flex-1 pt-8 ">
							<ul role="list">
								{navigation.map((item) => (
									<li key={item.name} className="flex ">
										<item.icon
											className="w-6 text-white shrink-0"
											aria-hidden="true"
										/>
										<a
											href={item.href}
											className="flex p-2 text-sm font-semibold leading-6 rounded-md text-inherit hover:bg-gray-800 group gap-x-3"
										>
											{item.name}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</div>
				</div>

				<main className="bg-white">{children}</main>
			</div>
		</>
	);
}
