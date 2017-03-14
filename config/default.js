const { transports } = require('corpjs-logger')

module.exports = {
  logger: {
    transportFactories: [
      () => new transports.Console({
        colorize: true,
        timestamp: true
      }),
      () => new transports.File({
        filename: 'all.log',
        timestamp: true
      })
    ]
  },
  endpoints: {
    endpointsFilePath: 'system-endpoints.json',
    normalize: false
  },
  server: {
    port: 3001
  }
}