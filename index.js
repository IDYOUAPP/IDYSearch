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
 * Created Date: Saturday, May 17th 2025, 1:09:39 pm                           *
 * Author: Prakersh Arya <prakersharya@codestax.ai>                            *
 * -----                                                                       *
 * Last Modified: May 17th 2025, 3:12:41 pm                                    *
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

const handler = async (event) => {
    console.log('came', event)
    let algoliaItem = {
        'INSERT': [],
        'DELETE': []
      };
    for (const record of event.Records) {
     
      
      const eventName = record.eventName; 
      const arn = record.eventSourceARN;
      const tableName = arn.split('/')[1]; 
      const newImage = record.dynamodb.NewImage
        ? unmarshall(record.dynamodb.NewImage)
        : {};
      const oldImage = record.dynamodb.OldImage
        ? unmarshall(record.dynamodb.OldImage)
        : {};
  
      newImage['tableName'] = tableName;
      oldImage['tableName'] = tableName;  
      
      try {
        switch (eventName) {
          case "INSERT":
          case "MODIFY":
            console.log('here', newImage)
            algoliaItem['INSERT'].push(InsertHelper.routeRequestToHelper(newImage));
            break;
          case "REMOVE":
            algoliaItem['DELETE'].push(InsertHelper.routeRequestToHelper(oldImage));
            break;
        }
      } catch (error) {
        console.error(`Algolia sync failed for event ${eventName}:`, error);
      }
    }

    await algoliaHelper.insertRecord(algoliaItem['INSERT']);
  
    return { statusCode: 200 };
  };
  
  module.exports = { handler }