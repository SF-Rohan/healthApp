'use strict';
const uuid = require('uuid').v4;
const { dynamo } = require('./utils');
const { recordValidator } = require('./validator');
const recordsTable = 'records'

const recordType = {
    STEPS: 'STEPS',
}

// Create a record
module.exports.bulkRecord = async (event, res) => {
    try {
        const reqBody = event.body
        await recordValidator.bulkRecord.validateAsync(reqBody);

        const { records, userId } = reqBody;

        const formatedRecords = records.map(({ type, name, value, start, end, }) => ({
            PutRequest: {
                Item: {
                    userId,
                    type,
                    id: uuid(),
                    createdAt: new Date().toISOString(),
                    name,
                    value,
                    start: new Date(start).toISOString(),
                    end: new Date(end).toISOString(),
                },
            }
        }))
        const record = await dynamo.call(dynamo.actions.batchWrite, {
            RequestItems: {
                [recordsTable]: formatedRecords
            }
        })
        res.statusCode = 201;
        return res.json({ data: { record }, message: 'Successfully Added', })
    } catch (error) {
        console.log(error)
        res.statusCode = 500;
        res.json({ error: error, message: 'Failure', });
    }
};

module.exports.createRecord = async (event, res) => {
    try {
        const reqBody = event.body
        await recordValidator.create.validateAsync(reqBody);

        const { userId, name, value, start, end, type = recordType.STEPS } = reqBody;

        const record = {
            userId,
            type,
            id: uuid(),
            createdAt: new Date().toISOString(),
            name,
            value,
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString(),
        }

        await dynamo.call(dynamo.actions.add, { TableName: recordsTable, Item: record, })

        return res.json({ data: { record }, message: 'Successfully Added', })

    } catch (error) {
        console.log(error)
        res.statusCode = 500;
        res.json({ error: error, message: 'Failure', });
    }
};

// Get all record
module.exports.getAllRecord = async (req, res) => {
    try {
        const params = {
            Key: {},
            TableName: recordsTable,
        };
        const { Items } = await dynamo.call(dynamo.actions.scan, params)

        return res.json({ data: { Items }, message: 'Success', })

    } catch (error) {
        console.log(error)
        res.statusCode = 500;
        res.json({ error: error, message: 'Failure', });
    }
};
