import SettingsItem from "@/components/settings/settings-item";
import { Inter } from "next/font/google";
import { open } from "@tauri-apps/api/dialog";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const inter = Inter({ subsets: ["latin"] });

export default function Settings() {
	const [directoryText, setDirectoryText] = useState("");
	useEffect(() => {
		invoke("get_configuration_option", {
			option_name: "book_folder_location",
		}).then((data) => {
			if (data == null) {
				setDirectoryText("Not set");
			} else {
				setDirectoryText(data);
			}
		});
	}, []);
	return (
		<div className="flex py-2 ml-20 min-h-screen  bg-white  px-5">
			<SettingsItem
				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsMethod={() => {
					console.log("yo");
					invoke("change_configuration_option", {
						option_name: "book_folder_location",
						value: directoryText,
					}).then((data) => {
						console.log(data);
					});
				}}
			>
				<span
					type="text"
					onClick={() => {
						open({
							directory: true,
							multiple: false,
						}).then((data) => {
							setDirectoryText(data);
						});
					}}
					className="flex-none text-blue-500 rounded-md text-blue-500 bg-white px-5 py-2.5 text-sm font-semibold  shadow-sm "
				>
					{directoryText}
				</span>
			</SettingsItem>
		</div>
	);
}
