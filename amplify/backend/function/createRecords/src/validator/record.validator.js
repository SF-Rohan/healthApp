const Joi = require('@hapi/joi');

module.exports = {
    create: Joi.object({
        userId: Joi.string().required(),
        name: Joi.string().required(),
        value: Joi.number().required(),
        start: Joi.string().required(),
        end: Joi.string().required(),
    }),
    bulkRecord: Joi.object({
        userId: Joi.string().required(),
        records: Joi.array().items(Joi.object({
            type: Joi.string().allow('SETPS').required(),
            name: Joi.string().required(),
            value: Joi.number().required(),
            start: Joi.string().required(),
            end: Joi.string().required(),
        })).required().max(24)
    }),
    getAll: Joi.object({
        userId: Joi.string(),
    }),
    getRecordById: Joi.object({
        id: Joi.string().required(),
    }),
}
