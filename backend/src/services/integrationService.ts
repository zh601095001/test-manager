import Integration from "../models/Integration";


// 获取设备设置
const getIntegrationSettings = async (testid: string) => {
    return Integration.findOne({testid});
};

// 更新设备设置
const updateIntegrationSettings = async (testid: string, data: any) => {
    const IntegrationSettings = await Integration.findOne({testid})
    if (!IntegrationSettings) {
        const newIntegration = new Integration({
            testid,
            settings: {
                ...data.settings
            }
        })
        await newIntegration.save()
    } else {
        IntegrationSettings.settings = {
            ...IntegrationSettings.settings as Object, ...data.settings
        }
        await IntegrationSettings.save()
    }

    return Integration.findOne({testid})
};


export default {
    getIntegrationSettings,
    updateIntegrationSettings
}