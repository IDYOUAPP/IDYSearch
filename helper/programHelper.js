
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
            "channel_url": dynamoDBRecord.programID,
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