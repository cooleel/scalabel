import Session from '../common/session'
import { LabelType, Select, ShapeType,
  TaskType, ViewerConfigType } from '../functional/types'
import * as types from './types'

/** init session */
export function initSessionAction (): types.InitSessionAction {
  return {
    type: types.INIT_SESSION,
    sessionId: Session.id
  }
}

/** update task data
 * @param {TaskType} newTask
 */
export function updateTask (newTask: TaskType): types.UpdateTaskAction {
  return {
    type: types.UPDATE_TASK,
    newTask,
    sessionId: Session.id
  }
}

/**
 * Go to item at index
 * @param {number} index
 * @return {types.ChangeSelectAction}
 */
export function goToItem (index: number): types.ChangeSelectAction {
  return {
    type: types.CHANGE_SELECT,
    sessionId: Session.id,
    select: { item: index }
  }
}

/**
 * Change the current selection
 * @param select
 */
export function changeSelect (
    select: Partial<Select>): types.ChangeSelectAction {
  return {
    type: types.CHANGE_SELECT,
    sessionId: Session.id,
    select
  }
}

/**
 * Create load item action
 */
export function loadItem (
    itemIndex: number, config: ViewerConfigType): types.LoadItemAction {
  return {
    type: types.LOAD_ITEM,
    sessionId: Session.id,
    itemIndex,
    config
  }
}

/**
 * Add label to the item
 * @param {number} itemIndex
 * @param {LabelType} label
 * @param {ShapeType[]} shapes
 * @return {AddLabelAction}
 */
export function addLabel (
  itemIndex: number, label: LabelType, shapeTypes: string[] = [],
  shapes: ShapeType[] = []): types.AddLabelsAction {
  return {
    type: types.ADD_LABELS,
    sessionId: Session.id,
    itemIndices: [itemIndex],
    labels: [[label]],
    shapeTypes: [[shapeTypes]],
    shapes: [[shapes]]
  }
}

/**
 * Add a track
 * @param itemIndices
 * @param labels
 * @param shapeTypes
 * @param shapes
 */
export function addTrack (
  itemIndices: number[],
  labels: LabelType[],
  shapeTypes: string[][],
  shapes: ShapeType[][]
): types.AddTrackAction {
  return {
    type: types.ADD_TRACK,
    sessionId: Session.id,
    itemIndices,
    labels,
    shapeTypes,
    shapes
  }
}

/**
 * Change the shape of the label
 * @param {number} itemIndex
 * @param {number} shapeId
 * @param {Partial<ShapeType>} props
 * @return {ChangeLabelShapeAction}
 */
export function changeLabelShape (
    itemIndex: number, shapeId: number, shape: Partial<ShapeType>
  ): types.ChangeShapesAction {
  return {
    type: types.CHANGE_SHAPES,
    sessionId: Session.id,
    itemIndices: [itemIndex],
    shapeIds: [[shapeId]],
    shapes: [[shape]]
  }
}

/**
 * Change the properties of the label
 * @param {number} itemIndex
 * @param {number} labelId
 * @param {Partial<LabelType>}props
 * @return {ChangeLabelPropsAction}
 */
export function changeLabelProps (
    itemIndex: number, labelId: number, props: Partial<LabelType>
  ): types.ChangeLabelsAction {
  return {
    type: types.CHANGE_LABELS,
    sessionId: Session.id,
    itemIndices: [itemIndex],
    labelIds: [[labelId]],
    props: [[props ]]
  }
}

/**
 * Link two labels
 * @param {number} itemIndex
 * @param {[]number} labelIds labels to link
 */
export function linkLabels (
    itemIndex: number, labelIds: number[]): types.LinkLabelsAction {
  return {
    type: types.LINK_LABELS,
    sessionId: Session.id,
    itemIndex,
    labelIds
  }
}

/**
 * Delete given label
 * @param {number} itemIndex
 * @param {number} labelId
 * @return {DeleteLabelAction}
 */
export function deleteLabel (
    itemIndex: number, labelId: number): types.DeleteLabelsAction {
  return {
    type: types.DELETE_LABELS,
    sessionId: Session.id,
    itemIndices: [itemIndex],
    labelIds: [[labelId]]
  }
}

/**
 * wrapper for update all action
 */
export function updateAll (): types.UpdateAllAction {
  return {
    type: types.UPDATE_ALL,
    sessionId: Session.id
  }
}
