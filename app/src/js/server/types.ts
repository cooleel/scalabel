import { ItemExport } from '../functional/bdd_types'
import { Attribute, ConfigType } from '../functional/types'

/**
 * Stores specifications of project
 */
export interface Project {
  /** array of items */
  items: ItemExport[]
  /** metadata about project */
  options: ProjectOptions
}

/**
 * Metadata for a project
 */
export interface ProjectOptions {
  /** frontend config */
  config: ConfigType
  /** whether project is submitted */
  submitted: boolean,
  /** whether we are in demo mode */
  demoMode: boolean,
}

/**
 * Stores specifications of a task
 */
export interface Task {
  /** metadata about project */
  options: ProjectOptions,
  /** index of particular task */
  index: number,
  /** array of items */
  items: ItemExport[]
}
/**
 * Information for backend environment variables
 * Populated using configuration file
 */
export interface Env {
  /** Port that server listens on */
  port: number
  /** Directory data is saved to and loaded from */
  data: string
  /** Base directory path */
  src: string
  /** Path from base dir to compiled src code */
  appSubDir: string
  /** Database storage method */
  database: string
  /** Flag to enable user management */
  userManagement: boolean
  /** Flag to enable session synchronization */
  sync: boolean
  /** Hostname for synchronization socket */
  syncHost: string
}

/**
 * Form data for project creation
 */
export interface CreationForm {
  /** name of project */
  projectName: string
  /** item type */
  itemType: string
  /** label type */
  labelType: string
  /** title of page */
  pageTitle: string
  /** task size */
  taskSize: number
  /** instructions link */
  instructions: string
  /** whether demo mode is true */
  demoMode: boolean
}

/* file data parsed from form */
export interface FormFileData {
  /** categories parsed from form file */
  categories: string[]
  /** attributes parsed from form file */
  attributes: Attribute[]
  /** items parsed from form file */
  items: ItemExport[]
}

/**
 * Defining the types of some general callback functions
 */
export type MaybeError = Error | null | undefined

/* socket.io event names */
export const enum EventName {
  ACTION_BROADCAST = 'actionBroadcast',
  ACTION_SEND = 'actionSend',
  REGISTER_ACK = 'registerAck',
  REGISTER = 'register',
  CONNECTION = 'connection',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect'
}

/* constant error codes used */
export const enum ErrorCode {
  NO_FILE = 'ENOENT'
}

/* database types for storage */
export const enum DatabaseType {
  S3 = 's3',
  DYNAMO_DB = 'dynamodb',
  LOCAL = 'local'
}

// TODO: change constants from post to get once go code is removed
/* endpoint names for http server */
export const enum Endpoint {
  POST_PROJECT = '/postProject',
  GET_PROJECT_NAMES = '/postProjectNames'
}

/* default categories when file is missing and label is box2D or box3D */
export const defaultBoxCategories = [
  'person',
  'rider',
  'car',
  'truck',
  'bus',
  'train',
  'motor',
  'bike',
  'traffic sign',
  'traffic light'
]

/* default categories when file is missing and label is polyline2D */
export const defaultPolyline2DCategories = [
  'road curb',
  'double white',
  'double yellow',
  'double other',
  'single white',
  'single yellow',
  'single other',
  'crosswalk'
]

/*
TODO: add buttonColors here
First need to add them to the attribute type
*/
/* default attributes when file is missing and label is box2D */
export const defaultBox2DAttributes = [
  {
    name: 'Occluded',
    toolType: 'switch',
    tagText: 'o',
    tagSuffixes: [],
    values: []
  },
  {
    name: 'Truncated',
    toolType: 'switch',
    tagText: 't',
    tagSuffixes: [],
    values: []
  },
  {
    name: 'Traffic Color Light',
    toolType: 'list',
    tagText: 't',
    tagSuffixes: ['', 'g', 'y', 'r'],
    values: ['NA', 'G', 'Y', 'R']
  }
]

/* default attributes when file is missing and no other defaults exist */
export const dummyAttributes = [{
  name: '',
  toolType: '',
  tagText: '',
  tagSuffixes: [],
  values: []
}]

/* form field names */
export const enum FormField {
  PROJECT_NAME = 'project_name',
  ITEM_TYPE = 'item_type',
  LABEL_TYPE = 'label_type',
  PAGE_TITLE = 'page_title',
  TASK_SIZE = 'task_size',
  INSTRUCTIONS_URL = 'instructions',
  DEMO_MODE = 'demo_mode',
  CATEGORIES = 'categories',
  ATTRIBUTES = 'attributes',
  ITEMS = 'item_file'
}

/* default config for env */
export const defaultEnv: Env = {
  port: 8686,
  data: './data',
  src: '.',
  appSubDir: 'app/dist',
  database: 'local',
  userManagement: false,
  sync: false,
  syncHost: 'http://localhost'
}
