type LogLevel = 'info' | 'error' | 'warn' | 'debug'

interface Logger {
  log: (level: LogLevel, message: string, ...optionalParams: unknown[]) => void
  info: (message: string, ...optionalParams: unknown[]) => void
  error: (message: string, ...optionalParams: unknown[]) => void
  warn: (message: string, ...optionalParams: unknown[]) => void
  debug: (message: string, ...optionalParams: unknown[]) => void
}

const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`
}

export const logger: Logger = {
  log: (level, message, ...optionalParams) => {
    const formattedMessage = formatMessage(level, message)
    switch (level) {
      case 'info':
        console.info(formattedMessage, ...optionalParams)
        break
      case 'error':
        console.error(formattedMessage, ...optionalParams)
        break
      case 'warn':
        console.warn(formattedMessage, ...optionalParams)
        break
      case 'debug':
        console.debug(formattedMessage, ...optionalParams)
        break
    }
  },
  info: (message, ...optionalParams) => {
    logger.log('info', message, ...optionalParams)
  },
  error: (message, ...optionalParams) => {
    logger.log('error', message, ...optionalParams)
  },
  warn: (message, ...optionalParams) => {
    logger.log('warn', message, ...optionalParams)
  },
  debug: (message, ...optionalParams) => {
    logger.log('debug', message, ...optionalParams)
  },
}
