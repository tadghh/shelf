import SettingsItem from "@/components/settings/settings-item";
import { Inter } from "next/font/google";
import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const inter = Inter({ subsets: ["latin"] });

export default function Settings() {
	const [directoryText, setDirectoryText] = useState("test");
	return (
		<div className="flex py-2 ml-20 min-h-screen  bg-white  px-5">
			<SettingsItem
				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsMethod={() => {
					console.log("yo");
					invoke("change_configuration_option", {
						option_name: "book_loc",
						value: directoryText,
					}).then((data) => {
						console.log(data);
					});
				}}
				className=" "
			>
				<input
					type="text"
					onClick={() => {
						open({
							directory: true,
							multiple: false,
						}).then((data) => {
							setDirectoryText(data);
						});
					}}
					value={directoryText}
					className="flex-none text-blue-500 rounded-md text-blue-500 bg-white px-5 py-2.5 text-sm font-semibold  shadow-sm "
				></input>
			</SettingsItem>
		</div>
	);
}
