const config = require('config');
const authController = require('../api/controllers/authController');

module.exports = {
    plugin: {
        async register(server, options) {
            server.route([
                {
                    method: 'POST',
                    path: '/login',
                    options: {
                        auth: null,
                        plugins: {
                            policies: ['log'],
                        },
                        tags:['api', 'Authentication'],
                        description: 'Login',
                        notes: 'Login',
                        validate: authController.login.validate,
                        pre: authController.login.pre,
                        handler: authController.login.handler
                    },
                },
                {
                    method: 'POST',
                    path: '/signup',
                    options: {
                        auth: null,
                        plugins: {
                            policies: ['log'],
                        },
                        tags: ['api', 'Authentication'],
                        description: 'Signup',
                        notes: 'Signup',
                        validate: authController.signup.validate,
                        pre: authController.signup.pre,
                        handler: authController.signup.handler
                    },
                },
            ]);
        },
        version: config.get('version'),
        name: 'auth',
    },
};