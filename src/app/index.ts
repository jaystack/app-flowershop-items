import Router from './Router'
import Config, { loaders } from 'corpjs-config'
import Endpoints from 'corpjs-endpoints'
import { App, Server } from 'corpjs-express'
import System from 'corpjs-system'
const { name } = require('../../package.json')

export default new System({ exitOnError: false })
  .add('config', new Config().add(config => loaders.require({ path: './config/default.js', mandatory: true })))
  .add('endpoints', Endpoints()).dependsOn({ component: 'config', source: 'endpoints', as: 'config' })
  .add('app', App())
  .add('router', Router()).dependsOn('endpoints', 'app')
  .add('server', Server(3001)).dependsOn('app', 'router')
  .on('componentStart', (componentName: string) => console.log(`Started component: ${componentName}`))
  .on('componentStop', (componentName: string) => console.log(`Stopped component: ${componentName}`))
  .on('start', () => console.log(`Started service: ${name}`))
  .on('stop', err => console.log(`Stopped service: ${name}`))
