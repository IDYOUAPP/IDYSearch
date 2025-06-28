
const { configObject } = require("../config");
const { encryptData, generateSHA256Hash } = require("./encryptionHelper");

class CourseHelper {
    constructor() {
        this.algoliaIndex = configObject.COURSE_TABLE.indexValue;
    }
    generateCourseData(dynamoDBRecord) {
        let obj = {}; let dataAddress = {};
        let objectID = '';
        objectID = generateSHA256Hash(dynamoDBRecord.pk + dynamoDBRecord.sk);
        dataAddress = encryptData({
            pk: dynamoDBRecord.pk,
            sk: dynamoDBRecord.sk,
            tableName: dynamoDBRecord.tableName
        });
        obj = {
            courseName: dynamoDBRecord.courseName,
            recordType: 'COURSE',
            imageURL: dynamoDBRecord.imageUrl,
            status: dynamoDBRecord.status,
            courseID: dynamoDBRecord.courseId,
            createdAt: dynamoDBRecord.createdAt,
            objectID,
            dataAddress,
        }
        return obj;
    }

    getRecord(dynamoDBRecord) {
        let algoliaDocument = {};
        if (dynamoDBRecord.type == 'COURSE') {
            algoliaDocument = this.generateCourseData(dynamoDBRecord);
        }
        return {
            algoliaItem: algoliaDocument,
            algoliaIndex: this.algoliaIndex
        };
    }
}

module.exports = new CourseHelper();