import { open } from "@tauri-apps/api/dialog";
import ToggleButton from "../Inputs/toggle-button";
const FileSettingComponent = ({ setter, status = "" }) => {
    return <span
        className="flex-none rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-blue-500 shadow-sm"
        onClick={() => {
            open({
                directory: true,
                multiple: false,
            }).then(data => {
                if (data) {
                    setter(data);
                }
            });
        }}
    >
        {status}
    </span>;
};
const ToggleSettingComponent = ({ setter, status }) => {
    return <ToggleButton onClick={() => setter(!status)} />;
};

export { FileSettingComponent, ToggleSettingComponent };
