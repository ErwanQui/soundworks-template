import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';
import ControllerExperience from './ControllerExperience.js';

import getConfig from '../utils/getConfig.js';
const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);
const server = new Server();

// html template and static files (in most case, this should not be modified)
server.templateEngine = { compile };
server.templateDirectory = path.join('.build', 'server', 'tmpl');
server.router.use(serveStatic('public'));
server.router.use('build', serveStatic(path.join('.build', 'public')));
server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

//////// ajout
import globalsSchema from './schemas/globals';
import playerSchema from './schemas/player';
import monsterSchema from './schemas/monster';
////////) ajout

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${ENV}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

// -------------------------------------------------------------------
// register plugins
// -------------------------------------------------------------------
// server.pluginManager.register(pluginName, pluginFactory, [pluginOptions], [dependencies])

// -------------------------------------------------------------------
// register schemas
// -------------------------------------------------------------------
// server.stateManager.registerSchema(name, schema);


(async function launch() {
  try {
    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: {
          name: config.app.name,
          author: config.app.author,
        },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          subpath: config.env.subpath,
        }
      };
    });

//////// ajout

    const playerExperience = new PlayerExperience(server, 'player');
    const controllerExperience = new ControllerExperience(server, 'controller');

    // testTry = new SharedStateManagerServer()
    // testTry.attach('number')
    server.stateManager.registerSchema('globals', globalsSchema)
    server.stateManager.registerSchema('player', playerSchema)
    // console.log(server)


    // src/server/index.js (line 62)
    const globalsState = await server.stateManager.create('globals');
    // console.log('globalsState:', globalsState.getValues());
    // > globalsState: { master: 0, mute: false }
    const parameters = globalsState.getValues();
    globalsState.set({NbMax: Math.ceil((parameters.Distance*parameters.Speed)/parameters.Time) + 1});

    for (let i = 1; i <= globalsState.getValues().NbMax; i++) {
      // console.log("bonsoir")
        server.stateManager.registerSchema('monster' + i, monsterSchema);
        // console.log(i);
    }

    ////////) ajout


    // start all the things
    await server.start();
    playerExperience.start();
    controllerExperience.start();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});