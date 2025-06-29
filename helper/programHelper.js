

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
}

module.exports = new ProgramHelper();