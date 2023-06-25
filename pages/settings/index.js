/* eslint-disable camelcase */
import SettingsItem from "@/components/settings/settings-item";
import { SettingsEnum } from "@/lib/SettingsItemEnum";

export default function Settings() {
	//The settings themselves should also be enums
	return (
		<div className="flex-col min-h-screen px-5 py-2 ml-20 bg-white">
			<SettingsItem

				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsConfigString="book_folder_location"
				settingsType={SettingsEnum.FILE}
			/>
			<SettingsItem
				settingsTitle="Endless Scrolling"
				settingsDescription="The next page will load as you scroll"
				settingsConfigString="endless_scroll"
				settingsType={SettingsEnum.TOGGLE}
			/>


		</div>
	);
}
