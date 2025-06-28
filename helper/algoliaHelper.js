
const algoliasearch = require('algoliasearch');
const { configObject } = require('../config');
class AlgoliaHelper {
    constructor() {
        this.ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
        this.ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
        this.ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
        this.algoliaClient = algoliasearch.algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_WRITE_API_KEY);
    }

    async insertRecord(allRecords) {
        const algoliaData = {
            [configObject.USER_TABLE.indexValue]: [],
            [configObject.PROGRAM_TABLE.indexValue]: [],
            [configObject.COURSE_TABLE.indexValue]: []
        };
        allRecords.forEach(element => {
            console.log(element);
            algoliaData[element.algoliaIndex].push(element.algoliaItem);
        });
        const allPromise = [];
        Object.keys(algoliaData).forEach((key) => {
            if (algoliaData[key].length > 0) {
                console.log(key, algoliaData[key]);
                allPromise.push(this.algoliaClient.saveObjects({
                    indexName: key,
                    objects: algoliaData[key]
                }));
            }
        });
        await Promise.all(allPromise);
    }

    async deleteRecords(allRecords) {
        const algoliaData = {
            [configObject.USER_TABLE.indexValue]: [],
            [configObject.PROGRAM_TABLE.indexValue]: [],
            [configObject.COURSE_TABLE.indexValue]: []
        };

        allRecords.forEach(element => {
            // Expecting `objectID` field in algoliaItem
            if (element?.algoliaIndex && element?.algoliaItem?.objectID) {
                algoliaData[element.algoliaIndex].push(element.algoliaItem.objectID);
            }
        });
        const allPromise = [];
        Object.keys(algoliaData).forEach((key) => {
            if (algoliaData[key].length > 0) {
                console.log(`Deleting from index ${key}:`, algoliaData[key]);
                const index = this.algoliaClient.initIndex(key);
                allPromise.push(index.deleteObjects(algoliaData[key]));
            }
        });
        await Promise.all(allPromise);
    }
}
module.exports = new AlgoliaHelper();
