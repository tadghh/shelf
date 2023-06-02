import SettingsItem from "@/components/settings/settings-item";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Settings() {
	return (
		<div className="flex  ml-20 min-h-screen  bg-white  px-5">
			<SettingsItem
				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsMethod={() => {
					console.log("yo");
				}}
				className=" "
			>
				<button
					type="button"
					className="flex-none rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					Apply
				</button>
			</SettingsItem>
		</div>
	);
}
