

const { configObject } = require("../config");
const { encryptData, generateSHA256Hash } = require("./encryptionHelper");

class UserHelper {
    constructor() {
        this.algoliaIndex = configObject.USER_TABLE.indexValue;
    }
    generateMentorData(dynamoDBRecord) {
        let obj = {}; let dataAddress = {};
        let objectID = '';
        objectID = generateSHA256Hash(dynamoDBRecord.pk + dynamoDBRecord.sk);
        dataAddress = encryptData({
            pk: dynamoDBRecord.pk,
            sk: dynamoDBRecord.sk,
            tableName: dynamoDBRecord.tableName
        });
        obj = {
            fullName: dynamoDBRecord.firstName + dynamoDBRecord.lastName,
            recordType: 'MENTOR',
            profilePicture: dynamoDBRecord.profilePicture,
            objectID,
            dataAddress
        }
        return obj;
    }

    generateMenteeData(dynamoDBRecord) {
        let obj = {};
        let objectID = '';
        let dataAddress = '';
        objectID = generateSHA256Hash(dynamoDBRecord.pk + dynamoDBRecord.sk);
        dataAddress = encryptData({
            pk: dynamoDBRecord.pk,
            sk: dynamoDBRecord.sk,
            tableName: dynamoDBRecord.tableName
        });
        obj = {
            fullName: dynamoDBRecord.firstName + dynamoDBRecord.lastName,
            recordType: 'MENTEE',
            profilePicture: dynamoDBRecord.profileUrl,
            objectID,
            dataAddress
        }
        return obj;
    }

    getRecord(dynamoDBRecord) {
        let algoliaDocument = {};
        if (dynamoDBRecord.sk === 'MENTOR') {
            algoliaDocument = this.generateMentorData(dynamoDBRecord);
        } else if (dynamoDBRecord.sk === 'MENTEE') {
            algoliaDocument = this.generateMenteeData(dynamoDBRecord);
        } else {
            console.error(`Record type not matched. Unexpected sk: '${dynamoDBRecord.sk}'`, dynamoDBRecord);
            return null;
        }

        return {
            algoliaItem: algoliaDocument,
            algoliaIndex: this.algoliaIndex
        };
    }

}

module.exports = new UserHelper();