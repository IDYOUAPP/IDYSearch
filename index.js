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
 * File: /index.js                                                             *
 * Project: identifymesearch                                                   *
 * Created Date: Sunday, July 13th 2025, 6:58:53 pm                            *
 * Author: Prakersh Arya <prakersharya@codestax.ai>                            *
 * -----                                                                       *
 * Last Modified: July 13th 2025, 7:22:48 pm                                   *
 * Modified By: Prakersh Arya                                                  *
 * -----                                                                       *
 * Any app that can be written in JavaScript,                                  *
 *     will eventually be written in JavaScript !!                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date         By  Comments                                                   *
 * --------------------------------------------------------------------------- *
 */


require('dotenv').config();
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const InsertHelper = require('./helper/insertHelper');
const algoliaHelper = require('./helper/algoliaHelper');
const sendBirdHelper = require('./helper/sendBirdHelper');

const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const algoliaItem = {
    INSERT: [],
    DELETE: []
  };

  let sendBirdItem = {
      'INSERT': [],
      'DELETE': []
  };
  for (const record of event.Records) {
    const { eventName, eventSourceARN, dynamodb } = record;

    const tableName = eventSourceARN.split('/')[1];
    const newImage = dynamodb.NewImage ? unmarshall(dynamodb.NewImage) : null;
    const oldImage = dynamodb.OldImage ? unmarshall(dynamodb.OldImage) : null;

    if (newImage) newImage.tableName = tableName;
    if (oldImage) oldImage.tableName = tableName;

    try {
      switch (eventName) {
        case "INSERT":
        case "MODIFY":
          if (newImage) {
            const insertPayload = InsertHelper.routeRequestToHelper(newImage);
            const insertPayloadSendBird = InsertHelper.routeRequestToSendBirdHelper(newImage);
            if (insertPayload) algoliaItem.INSERT.push(insertPayload);
            if (insertPayloadSendBird) sendBirdItem.INSERT.push(insertPayloadSendBird);
          }
          break;
        case "REMOVE":
          if (oldImage) {
            const deletePayload = InsertHelper.routeRequestToHelper(oldImage);
            if (deletePayload) algoliaItem.DELETE.push(deletePayload);
          }
          break;
        default:
          console.warn(`Unsupported event type: ${eventName}`);
      }
    } catch (error) {
      console.error(`Algolia sync failed for event ${eventName}:`, error);
    }
  }

  // Sync with Algolia
  try {
    if (algoliaItem.INSERT.length > 0) {
      await algoliaHelper.insertRecord(algoliaItem.INSERT);
    }
    if (sendBirdItem.INSERT.length > 0) {
      await sendBirdHelper.insertRecord(sendBirdItem.INSERT);
    }
    if (algoliaItem.DELETE.length > 0) {
      await algoliaHelper.deleteRecords(algoliaItem.DELETE);
    }
  } catch (error) {
    console.error("Algolia operation failed:", error);
    return { statusCode: 500, body: "Failed to sync with Algolia." };
  }

  return { statusCode: 200, body: "Sync successful." };
};

module.exports = { handler };
