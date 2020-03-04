'use strict';

const Glue = require('@hapi/glue');
const serverConfig = require('./bin/www');
const manifest = serverConfig.www;
const db = require('./database/db');

const options = {
    relativeTo: __dirname
};

const startServer = async function () {
    try {
        const server = await Glue.compose(manifest, options);
        await server.start();
        console.log('Server running on %s', server.info.uri);
    }
    catch (err) {
        console.error(`Server disconnect due to ${err}`);
        process.exit(1);
    }
};

startServer();