
'use strict';
const config = require('config');
const User = require('../api/models/user').schema;

module.exports.plugin = {
    async register(server, options) {
        const jwtValidate = async (decodedToken, request, h) => {
            let credentials = {
                user: {},
            };
            let isValid = false;
            credentials.user = await User.findById(decodedToken.user._id);
            if (credentials.user) {
                isValid = true;
            }
            request.userId = decodedToken.user._id;
            // Authentication Code will be here
            return {
                isValid,
                credentials,
            };
        };

        server.auth.strategy('authenticate', 'jwt', {
            key: config.get('constants.JWT_SECRET'),
            validate: jwtValidate,
            verifyOptions: {
                algorithms: ['HS256'],
            },
        });

        // Add helper method to get request ip
        const getIP = function (request) {
            // We check the headers first in case the server is behind a reverse proxy.
            return (
                request.headers['x-real-ip'] ||
                request.headers['x-forwarded-for'] ||
                request.info.remoteAddress
            );
        };
        server.method('getIP', getIP, {});
    },
    name: 'authenticate',
    version: config.get('version'),
};
