/* eslint-disable camelcase */
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { getComponentForEnum } from "@/lib/SettingsItemReturn";
export default function SettingsItem({
	settingsTitle,
	settingsConfigString,
	settingsType,
	settingsDescription = "",
}) {
	const [settingsItemStatus, setSettingsItemStatus] = useState("");
	const Component = getComponentForEnum(settingsType);

	const updateOption = () => {
		console.log("yo we changed" + settingsConfigString);
		invoke("change_configuration_option", {

			option_name: settingsConfigString,
			value: settingsItemStatus,
		}).then(data => {
			console.log(data);
		});
	};

	useEffect(() => {
		invoke("get_configuration_option", {
			option_name: settingsConfigString,
		}).then(data => {
			if (data == null) {
				setSettingsItemStatus("Not set");
			} else {
				setSettingsItemStatus(data);
			}
		});
	}, []);
	return (
		<div className="w-full border rounded-xl h-14 bg-gray-200 flex items-center justify-between">
			<div className="flex text-gray-900  ">
				<h2 className="text-2xl leading-4 font-bold pr-2 ">{settingsTitle}</h2>
				<p> {settingsDescription}</p>
			</div>
			<form>
				<div className="flex gap-x-4 px-2">
					{Component && <Component setter={setSettingsItemStatus} status={settingsItemStatus} />}
					<button
						type="button"
						onClick={updateOption}
						className=" rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Apply
					</button>
				</div>
			</form>
		</div>
	);
}
