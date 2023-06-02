export default function SettingsItem({
	settingsItemInfo,
	settingsMethod,
	children,
}) {
	return (
		<div className="bg-white py-32">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 grid-cols-12 gap-8 px-8">
				<div className="max-w-xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl col-span-7">
					<h2 className="inline ">{settingsItemInfo}</h2>
				</div>
				<form className="w-full max-w-md col-span-5 pt-2">
					<div className="flex gap-x-4">
						{children}
						<button
							type="button"
							onClick={settingsMethod}
							className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Apply
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
