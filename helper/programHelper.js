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
 * File: /helper/programHelper.js                                              *
 * Project: identifymesearch                                                   *
 * Created Date: Sunday, July 13th 2025, 6:58:53 pm                            *
 * Author: Prakersh Arya <prakersharya@codestax.ai>                            *
 * -----                                                                       *
 * Last Modified: July 13th 2025, 7:51:16 pm                                   *
 * Modified By: Prakersh Arya                                                  *
 * -----                                                                       *
 * Any app that can be written in JavaScript,                                  *
 *     will eventually be written in JavaScript !!                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date         By  Comments                                                   *
 * --------------------------------------------------------------------------- *
 */



const { configObject } = require("../config");
const { encryptData, generateSHA256Hash } = require("./encryptionHelper");

class ProgramHelper {
    constructor() {
        this.algoliaIndex = configObject.PROGRAM_TABLE.indexValue;
    }
    generateProgramData(dynamoDBRecord) {
        let obj = {}; let dataAddress = {};
        let objectID = '';
        objectID = generateSHA256Hash(dynamoDBRecord.pk + dynamoDBRecord.sk);
        dataAddress = encryptData({
            pk: dynamoDBRecord.pk,
            sk: dynamoDBRecord.sk,
            tableName: dynamoDBRecord.tableName
        });
        obj = {
            programName: dynamoDBRecord.programName,
            recordType: 'PROGRAM',
            programURL: dynamoDBRecord.programURL,
            status: dynamoDBRecord.status,
            programID: dynamoDBRecord.programID,
            userID: dynamoDBRecord.userID,
            createdAt: dynamoDBRecord.createdAt,
            objectID,
            dataAddress,
        }
        return obj;
    }
    generateProgramDataSendBird(dynamoDBRecord) {
        let obj = {}; let dataAddress = {};
        let objectID = '';
        obj = {
            "name": dynamoDBRecord.programName,
            // "channel_url": "private_chat_room_424",
            "cover_url": `${process.env.CLOUDFRONT_IMAGE_URL}/${dynamoDBRecord.programURL}`,
            "is_distinct": false,
            "is_public": true,
            "user_ids": [dynamoDBRecord.userID],
            "operator_ids": [dynamoDBRecord.userID]
        }
        return obj;
    }

    getRecord(dynamoDBRecord) {
        let algoliaDocument = {};
        if (dynamoDBRecord.type == 'PROGRAM') {
            algoliaDocument = this.generateProgramData(dynamoDBRecord);
        }
        else {
            console.error(`Record type not matched. Unexpected type: '${dynamoDBRecord.type}'`, dynamoDBRecord);
            return null;
        }
        return {
            algoliaItem: algoliaDocument,
            algoliaIndex: this.algoliaIndex
        };
    }
    getSendBirdRecord(dynamoDBRecord) {
        let sendBirdDocument = {};
        if (dynamoDBRecord.type == 'PROGRAM') {
            sendBirdDocument = this.generateProgramDataSendBird(dynamoDBRecord);
        }
        else {
            console.error(`Record type not matched. Unexpected type: '${dynamoDBRecord.type}'`, dynamoDBRecord);
            return null;
        }
        return {
            sendBirdItem: sendBirdDocument,
            recordType: 'PROGRAM'
        };
    }
}

module.exports = new ProgramHelper();