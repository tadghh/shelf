export default function SettingsItem({
	settingsTitle,
	settingsMethod,
	children,
	settingsDescription = "",
}) {
	return (
		<div className=" w-full border rounded-xl h-14 bg-gray-200 flex items-center justify-between">
			<div className=" flex  text-gray-900  ">
				<h2 className="text-2xl leading-4 font-bold pr-2 ">{settingsTitle}</h2>
				<p> {settingsDescription}</p>
			</div>
			<form className=" ">
				<div className="flex gap-x-4 px-2">
					{children}
					<button
						type="button"
						onClick={settingsMethod}
						className=" rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Apply
					</button>
				</div>
			</form>
		</div>
	);
}
