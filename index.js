#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const postmanToOpenApi = require('postman-to-openapi');
const yargs = require("yargs");
const mime = require('mime-types');
const options = yargs
  .usage("Usage: -d <directory> -p <port>")
  .option("d", { describe: "Directory path", type: "string", demandOption: true })
  .option("p", { alias: "port", describe: "Listening port", type: "number", demandOption: false })
  .argv;

const appPort = process.env.PORT || options.port || 5000;

async function setupApp() {
  const files = fs.readdirSync(path.join(process.cwd(), options.d));
  let combinedCollections = [];

  for(let i = 0; i < files.length; i++) {
    const fullPath = path.join(process.cwd(), `${options.d}/${files[i]}`);
    const fileType = mime.lookup(fullPath);
    if(fileType !== 'application/json') {
      console.log(`Skipping ${fullPath}, because not a JSON file...`);
      continue;
    }
    const insides = require(fullPath);
    const defaultTag = insides?.info?.name || 'General';

    try {
      const postmanResult = await postmanToOpenApi(fullPath, null, { defaultTag });
      combinedCollections.push(YAML.parse(postmanResult));
    } catch(ex) {
      console.log(`Not in the postman format, skipping ${fullPath}`);
      continue;
    }
  }

  const parsedCollections = combinedCollections.reduce((acc, collection) => ({
    ...acc,
    paths: {
      ...acc.paths,
      ...collection.paths
    }
  }), combinedCollections[0]);

  app.use('/', swaggerUi.serve, swaggerUi.setup(parsedCollections));

  app.listen(appPort, async function() {
    console.log(`Application listening on port ${appPort}!`)
  })

}

setupApp();
