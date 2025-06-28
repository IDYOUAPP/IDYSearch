

const userHelper = require('./userHelper');
const { configObject } = require('../config');
const programHelper = require('./programHelper');
const courseHelper = require('./courseHelper');
class InsertHelper {

    routeRequestToHelper(image) {
        if (image.tableName == configObject.USER_TABLE.tableName) {
            return userHelper.getRecord(image);
        } else if (image.tableName == configObject.PROGRAM_TABLE.tableName) {
            return programHelper.getRecord(image);
        }
        else if (image.tableName == configObject.COURSE_TABLE.tableName) {
            return courseHelper.getRecord(image);
        }
    }

}

module.exports = new InsertHelper();