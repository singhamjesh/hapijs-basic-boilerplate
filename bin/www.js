const config = require('config');
const fs = require('fs');
const authPlugin = require('../plugins/auth.plugin');
let plugins = [];


/**
 * set configuration according to .env
 * Function return process.env argument
 * @param {*} argument 
 */
const getArgument = argument => {
    return process.argv.indexOf(argument);
};

if (getArgument('--dev') !== -1) {
    process.env.NODE_ENV = 'development';
}

if (getArgument('--prod') !== -1) {
    process.env.NODE_ENV = 'production';
}

const ENV = config.util.getEnv('NODE_ENV').trim();
if (ENV !== 'production') {
    /**
     * Dev error implement for development env 
     */
    plugins = plugins.concat([
        {
            plugin: 'hapi-dev-errors',
            options: {
                showErrors: true,
                toTerminal: true,
            },
        },
    ]);

    /**
     * Set swagger option for swagger configuration
     * title is show on swagger ui
     * and version is also show in swagger ui
     * schemes is for both http/https option in swagger ui
     */
    let swaggerOptions = {
        info: {
            title: 'WEB API',
            version: config.get('version')
        },
        schemes : ['http', 'https'],
        basePath: '/v1',
        documentationPath: '/docs',
        expanded: 'none',
        tags: [],
        grouping: 'tags',
        securityDefinitions: {
            ApiKeyAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
            },
        },
    };
    plugins = plugins.concat([
        {
            plugin: '@hapi/inert',
        },
        {
            plugin: '@hapi/vision'
        },
        {
            plugin: 'hapi-swagger',
            options: swaggerOptions,
        }
    ])
}


/* Add plugin for more action */
plugins = plugins.concat([
    {
        plugin: '@hapi/good',
        options: {
            ops: {
                interval: 1000,
            },
            reporters: {
                myConsoleReporter: [
                    {
                        module: '@hapi/good-squeeze',
                        name: 'Squeeze',
                        args: [{ log: '*', request: '*', response: '*', error: '*' }],
                    },
                    {
                        module: '@hapi/good-console',
                    },
                    'stdout',
                ],
            },
        },
    },
    {
        plugin: 'hapi-auth-jwt2',
    },
    {
        plugin: '@hapi/basic',
    },
    {
        plugin: authPlugin,
    }
]);


/**
 * Auto route config 
 * Read all file name from route folder and auto create plugin for route
 * Create file in routes folder with extension .js 
 */
const baseFolder = __dirname.replace("bin","");
const routeFolder = baseFolder + 'routes/';
fs.readdirSync(routeFolder).forEach(fileName => {
    let route = fileName.replace(".js","");
    plugins = plugins.concat([
        {
            plugin: require(`../routes/${route}`),
            routes: {
                prefix: `/v1/${route}`,
            },
        },
    ]);
});


/**
 * Setup all www server option 
 * Added all required plugins and security with log 
 * this method content only serve setup and plugins 
 * its use in serve.js file with Glue.compose method
 */
module.exports.www = {
    server: {
        router: {
            stripTrailingSlash: true,
            isCaseSensitive: false,
        },
        routes: {
            security: {
                hsts: false,
                xss: true,
                noOpen: true,
                noSniff: true,
                xframe: false,
            },
            cors: {
                origin: ['*'],
                // ref: https://github.com/hapijs/hapi/issues/2986
                headers: ['Accept', 'Authorization', 'Content-Type'],
            },
            validate: {
                failAction: async (request, h, err) => {
                    request.server.log(
                        ['validation', 'error'],
                        'Joi throw validation error',
                    );
                    throw err;
                },
            },
            auth: false, // remove this to enable authentication or set your authentication profile ie. auth: 'jwt'
        },
        debug: config.get('debug'),
        port: config.get('port'),
    },
    register: {
        plugins,
    },
};