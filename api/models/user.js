'use strict';

const mongoose = require('mongoose');
const Bcrypt = require('bcrypt');
const { uuid } = require('uuidv4');
const Joi = require('@hapi/joi');

const db = require('../../database/db');
const errorHelper = require('../utils/error-helper');

const Schema = mongoose.Schema;
const Types = Schema.Types;
const modelName = 'user';

const UserSchema = new Schema(
    {
        firstName: {
            type: Types.String,
            default: null,
            canSearch: true,
        },
        lastName: {
            type: Types.String,
            default: null,
            canSearch: true,
        },
        email: {
            type: Types.String,
            required: true,
            unique: true,
            index: true,
            stringType: 'email',
            canSearch: true,
        },
        password: {
            type: Types.String,
            exclude: true,
            required: true,
        },
        emailVerified: {
            type: Types.Boolean,
            allowOnUpdate: false,
            default: false,
        },
        emailHash: {
            type: Types.String,
            default: null,
        },
        passwordLastUpdated: {
            type: Types.Date,
            default: null,
        },
        lastLogin: {
            type: Types.Date,
            default: null,
            canSort: true,
        },
        phone: {
            type: Types.String,
            maxlength: 12,
            minxlength: 10,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        collection: modelName,
        timestamps: true,
        versionKey: false,
    },
);

UserSchema.pre('save', async function (next) {
    let user = this;
    if (user.isNew) {
        const passHash = await user.generateHash(user.password);
        user.password = passHash.hash;
        const emailHash = await user.generateHash();
        user.emailHash = emailHash.hash;
        user.wasNew = true;
    }
    next();
});

UserSchema.methods = {
    generateHash: async function (key) {
        try {
            if (key === undefined) {
                key = uuid();
            }
            let salt = await Bcrypt.genSalt(10);
            let hash = await Bcrypt.hash(key, salt);
            return { key, hash };
        } catch (err) {
            errorHelper.handleError(err);
        }
    },
};


UserSchema.statics = {
    findByCredentials: async function (username, password) {
        try {
            const self = this;
            let query = { email: username.toLowerCase()};

            const schema = Joi.object({
                email: Joi.string().email()
            });
            const { error, value } = schema.validate({email:username});

            if (error) {
                query = {phone: username };
            }

            let mongooseQuery = self.findOne(query);
            let user = await mongooseQuery.lean();
            if (!user) {
                return false;
            }

            const source = user.password;
            let passwordMatch = await Bcrypt.compare(password, source);
            if (passwordMatch) {
                return user;
            }
        } catch (err) {
            errorHelper.handleError(err);
        }
    },
};


module.exports.schema = db.model(modelName, UserSchema);
