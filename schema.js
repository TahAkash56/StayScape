const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().allow("", null),
        price: Joi.number().min(0).required(),
        country: Joi.string().required(),
        location: Joi.string().required()
    }).required()
});

module.exports = listingSchema;