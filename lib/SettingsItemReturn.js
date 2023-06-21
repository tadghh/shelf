import { SettingsEnum } from './SettingsItemEnum';
import { FileSettingComponent, ToggleSettingComponent } from '@/components/settings/setting-item-types';

export const getComponentForEnum = (enumValue) => {
    const componentMap = {
        [SettingsEnum.FILE]: FileSettingComponent,
        [SettingsEnum.TOGGLE]: ToggleSettingComponent,
    };

    return componentMap[enumValue] || null;
};
