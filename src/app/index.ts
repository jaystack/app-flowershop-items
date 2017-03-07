import Router from './Router'
import Config, { loaders } from 'corpjs-config'
import Endpoints from 'corpjs-endpoints'
import { App, Server } from 'corpjs-express'
import System from 'corpjs-system'
const { name } = require('../../package.json')

const inDevelopment = process.env.NODE_ENV === 'dev'
process.on('unhandledRejection', err => console.error(err))

export default new System({ exitOnError: !inDevelopment })
  .add('config', new Config().add(config => loaders.require({ path: './config/default.js', mandatory: true })))
  .add('endpoints', Endpoints()).dependsOn({ component: 'config', source: 'endpoints', as: 'config' })
  .add('app', App())
  .add('router', Router()).dependsOn('endpoints', 'app')
  .add('server', Server()).dependsOn('app', 'router', { component: 'config', source: 'server', as: 'config' })
  .on('componentStart', (componentName: string) => console.log(`Started component: ${componentName}`))
  .on('componentStop', (componentName: string) => console.log(`Stopped component: ${componentName}`))
  .on('start', () => console.log(`Started service: ${name}`))
  .on('stop', (err, stopErr) => console.log(`Stopped service: ${name}`, err || '', stopErr || ''))
  .on('terminate', (signal) => console.log(signal))
