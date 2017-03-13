import Router from './Router'
import Config, { loaders } from 'corpjs-config'
import Endpoints from 'corpjs-endpoints'
import { App, Server } from 'corpjs-express'
import Logger from 'corpjs-logger'
import System from 'corpjs-system'
const { name } = require('../../package.json')

export default new System({ name })
  .add('config', new Config().add(config => loaders.require({ path: './config/default.js', mandatory: true })))
  .add('endpoints', Endpoints()).dependsOn({ component: 'config', source: 'endpoints', as: 'config' })
  .add('logger', Logger()).ignorable().dependsOn({ component: 'config', source: 'logger', as: 'config' })
  .add('app', App())
  .add('router', Router()).dependsOn('endpoints', 'app', 'logger')
  .add('server', Server()).dependsOn('app', 'router', { component: 'config', source: 'server', as: 'config' })
  .logAllEvents()