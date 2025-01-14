import * as winston from 'winston'
import { FileStorage } from './file_storage'
import { Storage } from './storage'
import { defaultEnv, Env } from './types'

/**
 * singleton for server global session
 */
class ServerSession {
  /** environment property for server session */
  private env: Env
  /** storage property for server session */
  private storage: Storage
  /** logger */
  private logger: winston.Logger

  constructor () {
    // create default env and storage
    this.env = defaultEnv
    this.storage = new FileStorage(this.env.data)
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console()
      ],
      exitOnError: false
    })
  }
  /**
   * gets storage
   */
  public getStorage (): Storage {
    return this.storage
  }

  /**
   * sets storage
   */
  public setStorage (storage: Storage) {
    this.storage = storage
  }

  /**
   * gets env
   */
  public getEnv (): Env {
    return this.env
  }

  /**
   * updates env, using defaults for missing fields
   */
  public setEnv (env: Partial<Env>) {
    // Make sure new env come last to override defaults
    this.env = {
      ...this.env,
      ...env
    }
  }

  /**
   * gets logger
   */
  public getLogger (): winston.Logger {
    return this.logger
  }

}

export default new ServerSession()
