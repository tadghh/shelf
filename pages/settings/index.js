/* eslint-disable camelcase */
import SettingsItem from "@/components/settings/settings-item";

export default function Settings() {

	return (
		<div className="flex min-h-screen px-5 py-2 ml-20 bg-white">
			<SettingsItem
				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsConfigString="book_folder_location"
				settingsType="FILE"
			/>


		</div>
	);
}
