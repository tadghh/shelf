import { open } from "@tauri-apps/api/dialog";

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

const ToggleSettingComponent = () => {
    return <div>Option B</div>;
};

export { FileSettingComponent, ToggleSettingComponent };
