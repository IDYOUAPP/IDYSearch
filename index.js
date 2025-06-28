
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