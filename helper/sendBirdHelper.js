/*
 * Trinom Digital Pvt Ltd ("COMPANY") CONFIDENTIAL                             *
 * Copyright (c) 2025 Trinom Digital Pvt Ltd, All rights reserved              *
 *                                                                             *
 * NOTICE:  All information contained herein is, and remains the property      *
 * of COMPANY. The intellectual and technical concepts contained herein are    *
 * proprietary to COMPANY and may be covered by Indian and Foreign Patents,    *
 * patents in process, and are protected by trade secret or copyright law.     *
 * Dissemination of this information or reproduction of this material is       *
 * strictly forbidden unless prior written permission is obtained from         *
 * COMPANY. Access to the source code contained herein is hereby forbidden     *
 * to anyone except current COMPANY employees, managers or contractors who     *
 * have executed Confidentiality and Non-disclosure agreements explicitly      *
 * covering such access.                                                       *
 *                                                                             *
 * The copyright notice above does not evidence any actual or intended         *
 * publication or disclosure of this source code, which includes               *
 * information that is confidential and/or proprietary, and is a trade secret, *
 * of COMPANY. ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC            *
 * PERFORMANCE, OR PUBLIC DISPLAY OF OR THROUGH USE OF THIS SOURCE CODE        *
 * WITHOUT THE EXPRESS WRITTEN CONSENT OF COMPANY IS STRICTLY PROHIBITED,      *
 * AND IN VIOLATION OF APPLICABLE LAWS AND INTERNATIONAL TREATIES. THE         *
 * RECEIPT OR POSSESSION OF THIS SOURCE CODE AND/OR RELATED INFORMATION DOES   *
 * NOT CONVEY OR IMPLY ANY RIGHTS TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS     *
 * CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT MAY DESCRIBE,    *
 * IN WHOLE OR IN PART.                                                        *
 *                                                                             *
 * File: /helper/algoliaHelper.js                                              *
 * Project: identifymesearch                                                   *
 * Created Date: Saturday, May 17th 2025, 1:51:18 pm                           *
 * Author: Prakersh Arya <prakersharya@codestax.ai>                            *
 * -----                                                                       *
 * Last Modified: July 13th 2025, 7:51:01 pm                                   *
 * Modified By: Prakersh Arya                                                  *
 * -----                                                                       *
 * Any app that can be written in JavaScript,                                  *
 *     will eventually be written in JavaScript !!                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date         By  Comments                                                   *
 * --------------------------------------------------------------------------- *
 */
const axios = require('axios');
class SendBirdHelper {
    constructor() {

        this.SENDBIRD_APP_ID = process.env.SENDBIRD_APP_ID;
        this.SENDBIRD_API_TOKEN = process.env.SENDBIRD_API_TOKEN;
    }

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
                        name,
                        cover_url,
                        is_distinct,
                        is_public,
                        user_ids,
                        operator_ids,
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


}
module.exports = new SendBirdHelper();
