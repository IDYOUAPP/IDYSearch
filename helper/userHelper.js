

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
            userType: 'MENTOR',
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
            userType: 'MENTEE',
            profilePicture: dynamoDBRecord.profilePicture,
            objectID,
            dataAddress
        }
        return obj;
    }

    getRecord(dynamoDBRecord) {
        let algoliaDocument = {};
        if (dynamoDBRecord.sk == 'MENTOR') {
            algoliaDocument = this.generateMentorData(dynamoDBRecord);
        } else if (dynamoDBRecord.sk == 'MENTEE') {
            algoliaDocument = this.generateMenteeData(dynamoDBRecord);
        }
        return {
            algoliaItem: algoliaDocument,
            algoliaIndex: this.algoliaIndex
        };
    }
}

module.exports = new UserHelper();