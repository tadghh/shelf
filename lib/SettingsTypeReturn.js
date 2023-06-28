import { SettingsEnum } from './SettingsTypeEnum';
import { FileSettingComponent, ToggleSettingComponent } from '@/components/settings/setting-item-components';

export const getComponentForEnum = (enumValue) => {
    const componentMap = {
        [SettingsEnum.FILE]: FileSettingComponent,
        [SettingsEnum.TOGGLE]: ToggleSettingComponent,
    };

    return componentMap[enumValue] || null;
};
