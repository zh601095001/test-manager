import Integration from "../models/Integration";


// 获取设备设置
const getIntegrationSettings = async (testid: string) => {
    return Integration.findOne({testid});
};

// 更新设备设置
const updateIntegrationSettings = async (testid: string, data: any) => {
    const IntegrationSettings = await Integration.findOne({ testid });
    let newIntegrationResult = [];

    if (data.integrationResult) {
        if (Array.isArray(data.integrationResult)) {
            newIntegrationResult = [...data.integrationResult];
        } else if (typeof data.integrationResult === 'object') {
            newIntegrationResult.push(data.integrationResult);
        }
    }

    if (IntegrationSettings) {
        if (Array.isArray(IntegrationSettings.integrationResult)) {
            newIntegrationResult = [...IntegrationSettings.integrationResult, ...newIntegrationResult];
        } else if (typeof IntegrationSettings.integrationResult === 'object') {
            newIntegrationResult.unshift(IntegrationSettings.integrationResult);
        }
    }

    if (!IntegrationSettings) {
        const newIntegration = new Integration({
            testid,
            settings: {
                ...data.settings
            },
            integrationResult: newIntegrationResult
        });
        await newIntegration.save();
    } else {
        IntegrationSettings.settings = {
            ...IntegrationSettings.settings as Object, ...data.settings
        };
        IntegrationSettings.integrationResult = newIntegrationResult;
        await IntegrationSettings.save();
    }

    return Integration.findOne({ testid });
};



export default {
    getIntegrationSettings,
    updateIntegrationSettings
}