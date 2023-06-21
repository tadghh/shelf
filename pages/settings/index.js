/* eslint-disable camelcase */
import SettingsItem from "@/components/settings/settings-item";

export default function Settings() {

	return (
		<div className="flex-col min-h-screen px-5 py-2 ml-20 bg-white">
			<SettingsItem

				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsConfigString="book_folder_location"
				settingsType="FILE"
			/>
			<SettingsItem
				settingsTitle="Endless Scrolling"
				settingsDescription="The next page will load as you scroll"
				settingsConfigString="endless_scroll"
				settingsType="BOOL"
			/>


		</div>
	);
}
