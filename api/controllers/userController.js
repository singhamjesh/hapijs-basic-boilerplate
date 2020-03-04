const Joi = require('@hapi/joi');
const errorHelper = require('../utils/error-helper');
const Token = require('../utils/create-token');
const User = require('../models/user').schema;
const Boom = require('@hapi/boom');
const config = require('config');

/**
 * Test for controller
 */
const index = {
    validate: {
        headers: Joi.object({
            authorization: Joi.string(),
        }).options({
            allowUnknown: true,
        }),
    },
    pre:[
        /* Defined pre method here */
    ],
    handler: async (request, h) => {
        try{
            console.log(request.userId);
            let userData = await User.findById(request.userId);
            userData.password = null;
            userData.emailHash = null;

            return h.response(userData).code(200);
        } catch(error){
            errorHelper.handleError(err);
        }
    },
}

module.exports = {
    index,
}