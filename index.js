
require('dotenv').config();
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const InsertHelper = require('./helper/insertHelper');
const algoliaHelper = require('./helper/algoliaHelper');

const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const algoliaItem = {
    INSERT: [],
    DELETE: []
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
            if (insertPayload) algoliaItem.INSERT.push(insertPayload);
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
