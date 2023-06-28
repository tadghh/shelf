/* eslint-disable camelcase */
import SettingsItem from "@/components/settings/settings-item";
import { SettingsTypes } from "@/lib/SettingsTypeEnum";
import { SettingsItems } from "@/lib/SettingsItemEnum";

export default function Settings() {
	return (
		<div className="flex-col min-h-screen px-5 py-2 ml-20 bg-white">
			<SettingsItem
				settingsTitle="Book directory"
				settingsDescription="The folder containing your books"
				settingsConfigString={SettingsItems.BOOK_LOCATION}
				settingsType={SettingsTypes.FILE}
			/>
			<SettingsItem
				settingsTitle="Endless scrolling"
				settingsDescription="The next page will load as you scroll"
				settingsConfigString={SettingsItems.ENDLESS_SCROLL}
				settingsType={SettingsTypes.TOGGLE}
			/>
		</div>
	);
}
