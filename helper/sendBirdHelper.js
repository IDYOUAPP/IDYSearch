const axios = require('axios');
class SendBirdHelper {
    constructor() {

        this.SENDBIRD_APP_ID = process.env.SENDBIRD_APP_ID;
        this.SENDBIRD_API_TOKEN = process.env.SENDBIRD_API_TOKEN;
    }
    updateUser = async function (userId, userData) {
        const APP_ID = process.env.SENDBIRD_APP_ID;
        const API_TOKEN = process.env.SENDBIRD_API_TOKEN;
        const API_BASE_URL = `https://api-${APP_ID}.sendbird.com/v3`;
        try {
            const updateUrl = `${API_BASE_URL}/users/${userId}`;
            const requestBody = {
                nickname: userData.nickname,
                profile_url: userData.profile_url,
            };
            await axios.put(
                updateUrl,
                requestBody,
                {
                    headers: { 'Api-Token': API_TOKEN },
                }
            );
            console.log(`User ${userId} successfully updated.`);
            return true;
        } catch (error) {
            console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
            return false;
        }
    };

    updateProgram = async function (channelUrl, programData) {
        const APP_ID = process.env.SENDBIRD_APP_ID;
        const API_TOKEN = process.env.SENDBIRD_API_TOKEN;
        const API_BASE_URL = `https://api-${APP_ID}.sendbird.com/v3`;
        try {
            const updateUrl = `${API_BASE_URL}/group_channels/${channelUrl}`;

            const requestBody = {
                name: programData.name,
                cover_url: programData.cover_url,
            };
            await axios.put(
                updateUrl,
                requestBody,
                {
                    headers: { 'Api-Token': API_TOKEN },
                }
            );
            console.log(`Channel ${channelUrl} successfully updated.`);
            return true;
        } catch (error) {
            console.error(`Error updating channel ${channelUrl}:`, error.response?.data || error.message);
            return false;
        }
    };


    async insertRecord(allRecords) {
        const userUrl = `https://api-${this.SENDBIRD_APP_ID}.sendbird.com/v3/users`;
        const channelUrl = `https://api-${this.SENDBIRD_APP_ID}.sendbird.com/v3/group_channels`;

        for (const record of allRecords) {
            const { recordType, sendBirdItem } = record;

            if (recordType === 'PROGRAM') {
                // Extract values from sendBirdItem
                const {
                    name,
                    cover_url,
                    is_distinct = false,
                    is_public = true,
                    user_ids,
                    operator_ids
                } = sendBirdItem;

                try {
                    const response = await axios.post(
                        channelUrl,
                        {
                            ...sendBirdItem
                        },
                        {
                            headers: {
                                'Api-Token': this.SENDBIRD_API_TOKEN,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    console.log(`Channel created: ${response.data.channel_url}`);
                } catch (error) {
                    console.error(`Failed to create channel for program '${name}'`, error.response?.data || error.message);
                }

            } else {
                // Create user (default flow)
                const { user_id, nickname, profile_url } = sendBirdItem;

                try {
                    const response = await axios.post(
                        userUrl,
                        {
                            user_id,
                            nickname: nickname || user_id,
                            profile_url: profile_url || '',
                        },
                        {
                            headers: {
                                'Api-Token': this.SENDBIRD_API_TOKEN,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    console.log(`User created: ${user_id}`);
                } catch (error) {
                    if (error.response?.status === 400 && error.response.data.code === 400201) {
                        console.log(`User already exists: ${user_id}`);
                    } else {
                        console.error(`Failed to create user ${user_id}`, error.response?.data || error.message);
                    }
                }
            }
        }
    }
    async upsertRecords(allRecords) {
        const userUrl = `https://api-${this.SENDBIRD_APP_ID}.sendbird.com/v3/users`;
        const channelUrl = `https://api-${this.SENDBIRD_APP_ID}.sendbird.com/v3/group_channels`;
        for (const record of allRecords) {
            const { recordType, sendBirdItem } = record;

            if (recordType === 'PROGRAM') {
                if (sendBirdItem.channel_url) {
                    await this.updateProgram(sendBirdItem.channel_url, sendBirdItem);
                } else {
                    try {
                        const response = await axios.post(
                            channelUrl,
                            sendBirdItem,
                            { headers: { 'Api-Token': this.SENDBIRD_API_TOKEN } }
                        );
                        console.log(`Channel created: ${response.data.channel_url}`);
                    } catch (error) {
                        console.error(`Failed to create channel for program '${sendBirdItem.name}'`, error.response?.data || error.message);
                    }
                }
            } else {
                const { user_id, nickname, profile_url } = sendBirdItem;
                try {
                    await axios.post(
                        userUrl,
                        {
                            user_id,
                            nickname: nickname || user_id,
                            profile_url: profile_url || '',
                        },
                        { headers: { 'Api-Token': this.SENDBIRD_API_TOKEN } }
                    );
                    console.log(`User created: ${user_id}`);
                } catch (error) {
                    if (error.response?.data?.code === 400201) {
                        console.log(`User already exists: ${user_id}. Attempting to update.`);
                        await this.updateUser(user_id, { nickname, profile_url });
                    } else {
                        console.error(`Failed to create user ${user_id}`, error.response?.data || error.message);
                    }
                }
            }
        }
    }


}
module.exports = new SendBirdHelper();
