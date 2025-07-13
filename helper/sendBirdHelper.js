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
 * Last Modified: July 13th 2025, 6:45:20 pm                                   *
 * Modified By: Prakersh Arya                                                  *
 * -----                                                                       *
 * Any app that can be written in JavaScript,                                  *
 *     will eventually be written in JavaScript !!                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date         By  Comments                                                   *
 * --------------------------------------------------------------------------- *
 */
const algoliasearch = require('algoliasearch');
const { configObject } = require('../config');
const axios = require('axios');
class SendBirdHelper {
    constructor() {

        this.SENDBIRD_APP_ID = 'BE6E59B3-11F9-46DE-9F0B-3141787EB742';
        this.SENDBIRD_API_TOKEN = 'b3e5d28ba5ff53a08eab27044dc1aad8d19dc1b5';
        this.ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
        this.algoliaClient = algoliasearch.algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_WRITE_API_KEY);
    }

    async insertRecord(allRecords) {
        const url = `https://api-${this.SENDBIRD_APP_ID}.sendbird.com/v3/users`;

        for (const record of allRecords) {
            const { user_id, nickname, profile_url } = record.sendBirdItem;

            try {
                const response = await axios.post(
                    url,
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
                if (error.response && error.response.status === 400 && error.response.data.code === 400201) {
                    console.log(`User already exists: ${user_id}`);
                } else {
                    console.error(`Failed to create user ${user_id}`, error.response?.data || error.message);
                }
            }
        }
    }

    async deleteRecords(allRecords) {
        const algoliaData = {
            [configObject.USER_TABLE.indexValue]: [],
            [configObject.PROGRAM_TABLE.indexValue]: []
        };

        allRecords.forEach(element => {
            // Expecting `objectID` field in algoliaItem
            if (element?.algoliaIndex && element?.algoliaItem?.objectID) {
                algoliaData[element.algoliaIndex].push(element.algoliaItem.objectID);
            }
        });
        const allPromise = [];
        Object.keys(algoliaData).forEach((key) => {
            if (algoliaData[key].length > 0) {
                console.log(`Deleting from index ${key}:`, algoliaData[key]);
                const index = this.algoliaClient.initIndex(key);
                allPromise.push(index.deleteObjects(algoliaData[key]));
            }
        });
        await Promise.all(allPromise);
    }
}
module.exports = new SendBirdHelper();
