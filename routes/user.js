const config = require('config');
const userController = require('../api/controllers/userController');

module.exports = {
    plugin: {
        async register(server, options) {
            server.route([
                {
                    method: 'GET',
                    path: '/index',
                    options: {
                        auth: 'authenticate',
                        plugins: {
                            policies: [],
                            'hapi-swagger': {
                                security: [
                                    {
                                        ApiKeyAuth: [],
                                    },
                                ],
                            },
                        },
                        tags: ['api', 'User'],
                        description: 'User',
                        notes: 'User',
                        validate: userController.index.validate,
                        pre: userController.index.pre,
                        handler: userController.index.handler
                    },
                }
            ]);
        },
        version: config.get('version'),
        name: 'user',
    },
};