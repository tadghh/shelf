/* eslint-disable camelcase */
import SettingsItem from "@/components/settings/settings-item";
import { open } from "@tauri-apps/api/dialog";

export default function Settings() {

	return (
		<div className="ml-20 flex min-h-screen bg-white  px-5  py-2">
			<SettingsItem
				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsConfigString="book_folder_location"
			/>


		</div>
	);
}
