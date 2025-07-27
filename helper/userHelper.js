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
            status: dynamoDBRecord.status,
            profilePicture: dynamoDBRecord.profilePicture,
            objectID,
            dataAddress
        }
        return obj;
    }
    generateMentorDataSendBird(dynamoDBRecord) {
        let obj = {
            "user_id": dynamoDBRecord.userID,
            "nickname": dynamoDBRecord.firstName + dynamoDBRecord.lastName,
            "profile_url": `${process.env.CLOUDFRONT_IMAGE_URL}/${dynamoDBRecord.profilePicture}`
            // "issue_access_token": true,
            // "session_token_expires_at": 1542945056625,
        }
        return obj;
    }
    generateMenteeDataSendBird(dynamoDBRecord) {
        let obj = {
            "user_id": dynamoDBRecord.menteeId,
            "nickname": dynamoDBRecord.firstName + dynamoDBRecord.lastName,
            "profile_url": `${process.env.CLOUDFRONT_IMAGE_URL}/${dynamoDBRecord.profileUrl}`
            // "issue_access_token": true,
            // "session_token_expires_at": 1542945056625,
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
            status: dynamoDBRecord.status,
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


    getSendBirdRecord(dynamoDBRecord) {
        let sendBirdDocument = {};
        if (dynamoDBRecord.sk == 'MENTOR') {
            sendBirdDocument = this.generateMentorDataSendBird(dynamoDBRecord);
        } else if (dynamoDBRecord.sk == 'MENTEE') {
            sendBirdDocument = this.generateMenteeDataSendBird(dynamoDBRecord);
        }
        return {
            sendBirdItem: sendBirdDocument,
            recordType: 'USERS'
        };
    }
}

module.exports = new UserHelper();