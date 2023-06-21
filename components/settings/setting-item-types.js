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
const ToggleSettingComponent = ({ setter, status = true }) => {
    //This is bad and should be rewritten to use checked
    return <div onClick={() => setter(!status)}><ToggleButton /></div>;
};

export { FileSettingComponent, ToggleSettingComponent };
