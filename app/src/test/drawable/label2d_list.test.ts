import { createCanvas } from 'canvas'
import _ from 'lodash'
import * as action from '../../js/action/common'
import Session from '../../js/common/session'
import { initStore } from '../../js/common/session_init'
import { Label2DList } from '../../js/drawable/2d/label2d_list'
import { getShape } from '../../js/functional/state_util'
import { PolygonType, RectType } from '../../js/functional/types'
import { Size2D } from '../../js/math/size2d'
import { Vector2D } from '../../js/math/vector2d'
import { testJson } from '../test_image_objects'

test('Draw 2d boxes to label2d list', () => {
  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })

  // Draw first box
  const canvasSize = new Size2D(100, 100)
  label2dList.onMouseDown(new Vector2D(1, 1), -1, 0)
  label2dList.onMouseMove(new Vector2D(10, 10), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(10, 10), -1, 0)
  let state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(1)
  let rect = getShape(state, 0, 0, 0) as RectType
  expect(rect.x1).toEqual(1)
  expect(rect.y1).toEqual(1)
  expect(rect.x2).toEqual(10)
  expect(rect.y2).toEqual(10)

  // Second box
  label2dList.onMouseDown(new Vector2D(19, 20), -1, 0)
  label2dList.onMouseMove(new Vector2D(25, 25), canvasSize, -1, 0)
  label2dList.onMouseMove(new Vector2D(30, 29), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(30, 29), -1, 0)

  state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(2)
  rect = getShape(state, 0, 1, 0) as RectType
  expect(rect.x1).toEqual(19)
  expect(rect.y1).toEqual(20)
  expect(rect.x2).toEqual(30)
  expect(rect.y2).toEqual(29)

  // third box
  label2dList.onMouseDown(new Vector2D(4, 5), -1, 0)
  label2dList.onMouseMove(new Vector2D(15, 15), canvasSize, -1, 0)
  label2dList.onMouseMove(new Vector2D(23, 24), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(23, 24), -1, 0)
  state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(3)
  rect = getShape(state, 0, 2, 0) as RectType
  expect(rect.x1).toEqual(4)
  expect(rect.y1).toEqual(5)
  expect(rect.x2).toEqual(23)
  expect(rect.y2).toEqual(24)

  // resize the second box
  label2dList.onMouseDown(new Vector2D(19, 20), 1, 1)
  label2dList.onMouseMove(new Vector2D(15, 18), canvasSize, -1, 0)
  label2dList.onMouseMove(new Vector2D(16, 17), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(16, 17), -1, 0)
  state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(3)
  rect = getShape(state, 0, 1, 0) as RectType
  expect(rect.x1).toEqual(16)
  expect(rect.y1).toEqual(17)

  // flip top left and bottom right corner
  label2dList.onMouseDown(new Vector2D(16, 17), 1, 1)
  label2dList.onMouseMove(new Vector2D(42, 43), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(40, 41), -1, 0)
  state = Session.getState()
  rect = getShape(state, 0, 1, 0) as RectType
  expect(rect.x1).toEqual(30)
  expect(rect.y1).toEqual(29)
  expect(rect.x2).toEqual(42)
  expect(rect.y2).toEqual(43)

  // move
  label2dList.onMouseDown(new Vector2D(32, 31), 1, 0)
  label2dList.onMouseMove(new Vector2D(36, 32), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(36, 32), -1, 0)
  state = Session.getState()
  rect = getShape(state, 0, 1, 0) as RectType
  expect(rect.x1).toEqual(34)
  expect(rect.y1).toEqual(30)
  expect(rect.x2).toEqual(46)
  expect(rect.y2).toEqual(44)

  // delete label
  Session.dispatch(action.deleteLabel(0, 1))
  expect(label2dList.labelList.length).toEqual(2)
  expect(label2dList.labelList[0].index).toEqual(0)
  expect(label2dList.labelList[0].labelId).toEqual(0)
  expect(label2dList.labelList[1].index).toEqual(1)
  expect(label2dList.labelList[1].labelId).toEqual(2)
})

test('Draw 2d polygons to label2d list', () => {
  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  Session.dispatch(action.changeSelect({ labelType: 1 }))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })
  // check for Drawing process
  const canvasSize = new Size2D(100, 100)
  label2dList.onMouseDown(new Vector2D(1, 1), -1, 0)
  label2dList.onMouseUp(new Vector2D(1, 1), -1, 0)
  label2dList.onMouseMove(new Vector2D(10, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(10, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(10, 10), -1, 0)
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(20, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(20, 10), -1, 0)
  /**
   * (1, 1) (10, 10) (20, 10)
   */
  let state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(0)

  // drag when drawing
  label2dList.onMouseMove(new Vector2D(20, 1), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(20, 1), -1, 0)
  label2dList.onMouseMove(new Vector2D(10, 0), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(10, 0), -1, 0)
  label2dList.onMouseMove(new Vector2D(1, 1), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(1, 1), -1, 1)
  label2dList.onMouseUp(new Vector2D(1, 1), -1, 1)
  /**
   * (1, 1) (10, 10) (20, 10) (10, 0)
   */
  state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(1)
  let polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points.length).toEqual(4)
  expect(polygon.points[0].x).toEqual(1)
  expect(polygon.points[0].y).toEqual(1)
  expect(polygon.points[0].type).toEqual('vertex')
  expect(polygon.points[1].x).toEqual(10)
  expect(polygon.points[1].y).toEqual(10)
  expect(polygon.points[1].type).toEqual('vertex')
  expect(polygon.points[2].x).toEqual(20)
  expect(polygon.points[2].y).toEqual(10)
  expect(polygon.points[2].type).toEqual('vertex')
  expect(polygon.points[3].x).toEqual(10)
  expect(polygon.points[3].y).toEqual(0)
  expect(polygon.points[3].type).toEqual('vertex')
  /**
   * (1, 1) (10, 10) (20, 10) (10, 0)
   */

  // draw second polygon
  label2dList.onMouseMove(new Vector2D(50, 50), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(50, 50), -1, 0)
  label2dList.onMouseUp(new Vector2D(50, 50), -1, 0)
  label2dList.onMouseMove(new Vector2D(60, 40), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(60, 40), -1, 0)
  label2dList.onMouseUp(new Vector2D(60, 40), -1, 0)
  label2dList.onMouseMove(new Vector2D(70, 70), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(70, 70), -1, 0)
  label2dList.onMouseUp(new Vector2D(70, 70), -1, 0)
  label2dList.onMouseMove(new Vector2D(50, 50), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(50, 50), -1, 1)
  label2dList.onMouseUp(new Vector2D(50, 50), -1, 1)
  /**
   * (1, 1) (10, 10) (20, 10) (10, 0)
   * (50, 50) (60, 40) (70, 70)
   */

  state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(2)
  polygon = getShape(state, 0, 1, 0) as PolygonType
  expect(polygon.points[0].x).toEqual(50)
  expect(polygon.points[0].y).toEqual(50)
  expect(polygon.points[0].type).toEqual('vertex')
  expect(polygon.points[1].x).toEqual(60)
  expect(polygon.points[1].y).toEqual(40)
  expect(polygon.points[1].type).toEqual('vertex')
  expect(polygon.points[2].x).toEqual(70)
  expect(polygon.points[2].y).toEqual(70)
  expect(polygon.points[2].type).toEqual('vertex')
  expect(polygon.points.length).toEqual(3)
  expect(label2dList.labelList.length).toEqual(2)
  /**
   * (1, 1) (10, 10) (20, 10) (10, 0)
   * (50, 50) (60, 40) (70, 70)
   */
})

test('2d polygons highlighted and selected', () => {
  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  Session.dispatch(action.changeSelect({ labelType: 1 }))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })

  // draw one polygon
  const canvasSize = new Size2D(100, 100)
  label2dList.onMouseMove(new Vector2D(12, 12), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(12, 12), -1, 0)
  label2dList.onMouseUp(new Vector2D(12, 12), -1, 0)
  label2dList.onMouseMove(new Vector2D(21, 21), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(21, 21), -1, 0)
  label2dList.onMouseUp(new Vector2D(21, 21), -1, 0)
  label2dList.onMouseMove(new Vector2D(31, 26), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(31, 26), -1, 0)
  label2dList.onMouseUp(new Vector2D(31, 26), -1, 0)
  label2dList.onMouseMove(new Vector2D(41, 21), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(41, 21), -1, 0)
  label2dList.onMouseUp(new Vector2D(41, 21), -1, 0)
  label2dList.onMouseMove(new Vector2D(21, 11), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(21, 11), -1, 0)
  label2dList.onMouseUp(new Vector2D(21, 11), -1, 0)
  label2dList.onMouseMove(new Vector2D(12, 12), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(12, 12), -1, 1)
  label2dList.onMouseUp(new Vector2D(12, 12), -1, 1)
  /**
   * (12, 12) (21, 21) (31, 26) (41, 21) (21, 11)
   */
  // draw another polygon
  label2dList.onMouseMove(new Vector2D(50, 50), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(50, 50), -1, 0)
  label2dList.onMouseUp(new Vector2D(50, 50), -1, 0)
  label2dList.onMouseMove(new Vector2D(60, 40), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(60, 40), -1, 0)
  label2dList.onMouseUp(new Vector2D(60, 40), -1, 0)
  label2dList.onMouseMove(new Vector2D(70, 70), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(70, 70), -1, 0)
  label2dList.onMouseUp(new Vector2D(70, 70), -1, 0)
  label2dList.onMouseMove(new Vector2D(50, 50), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(50, 50), -1, 1)
  label2dList.onMouseUp(new Vector2D(50, 50), -1, 1)
  /**
   * (12, 12) (21, 21) (31, 26) (41, 21) (21, 11)
   * (50, 50) (60, 40) (70, 70)
   */

  // change highlighted
  label2dList.onMouseMove(new Vector2D(13, 13), canvasSize, 0, 0)
  let highlighted = label2dList.highlightedLabel
  let selected = label2dList.selectedLabel
  if (!highlighted) {
    throw new Error('no highlightedLabel')
  } else {
    expect(highlighted.labelId).toEqual(0)
  }
  if (!selected) {
    throw new Error('no selectedLabel')
  } else {
    expect(selected.labelId).toEqual(1)
  }

  // change selected
  label2dList.onMouseDown(new Vector2D(13, 13), 0, 0)
  label2dList.onMouseMove(new Vector2D(14, 14), canvasSize, 0, 0)
  label2dList.onMouseUp(new Vector2D(14, 14), 0, 0)
  highlighted = label2dList.highlightedLabel
  selected = label2dList.selectedLabel
  if (highlighted) {
    expect(highlighted.labelId).toEqual(0)
  }
  if (!selected) {
    throw new Error('no selectedLabel')
  } else {
    expect(selected.labelId).toEqual(0)
  }
})

test('validation check for polygon2d', () => {
  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  Session.dispatch(action.changeSelect({ labelType: 1 }))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })

  const canvasSize = new Size2D(100, 100)
  // draw a valid polygon
  label2dList.onMouseMove(new Vector2D(12, 12), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(12, 12), -1, 0)
  label2dList.onMouseUp(new Vector2D(12, 12), -1, 0)
  label2dList.onMouseMove(new Vector2D(21, 21), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(21, 21), -1, 0)
  label2dList.onMouseUp(new Vector2D(21, 21), -1, 0)
  label2dList.onMouseMove(new Vector2D(31, 26), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(31, 26), -1, 0)
  label2dList.onMouseUp(new Vector2D(31, 26), -1, 0)
  label2dList.onMouseMove(new Vector2D(41, 21), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(41, 21), -1, 0)
  label2dList.onMouseUp(new Vector2D(41, 21), -1, 0)
  label2dList.onMouseMove(new Vector2D(21, 11), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(21, 11), -1, 0)
  label2dList.onMouseUp(new Vector2D(21, 11), -1, 0)
  label2dList.onMouseMove(new Vector2D(12, 12), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(12, 12), -1, 1)
  label2dList.onMouseUp(new Vector2D(12, 12), -1, 1)
  /**
   * (12, 12) (21, 21) (31, 26) (41, 21) (21, 11)
   */
  // draw one invalid polygon
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(20, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(20, 10), -1, 0)
  label2dList.onMouseMove(new Vector2D(40, 30), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(40, 30), -1, 0)
  label2dList.onMouseUp(new Vector2D(40, 30), -1, 0)
  label2dList.onMouseMove(new Vector2D(30, 20), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(30, 20), -1, 0)
  label2dList.onMouseUp(new Vector2D(30, 20), -1, 0)
  label2dList.onMouseMove(new Vector2D(30, 0), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(30, 0), -1, 0)
  label2dList.onMouseUp(new Vector2D(30, 0), -1, 0)
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(20, 10), -1, 1)
  label2dList.onMouseUp(new Vector2D(20, 10), -1, 1)
  /**
   * (12, 12) (21, 21) (31, 26) (41, 21) (21, 11)
   * (20, 10) (40, 30) (30, 20) (30, 0) invalid
   */
  let state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(1)
  expect(label2dList.labelList.length).toEqual(1)

  // drag to invalid
  label2dList.onMouseMove(new Vector2D(31, 26), canvasSize, 0, 5)
  label2dList.onMouseDown(new Vector2D(31, 26), 0, 5)
  label2dList.onMouseMove(new Vector2D(31, 0), canvasSize, 0, 5)
  label2dList.onMouseUp(new Vector2D(31, 0), 0, 5)
  /**
   * (12, 12) (21, 21) (31, 0) (41, 21) (21, 11) invalid
   */

  state = Session.getState()
  const polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points[2].x).toEqual(31)
  expect(polygon.points[2].y).toEqual(26)
  expect(polygon.points[2].type).toEqual('vertex')
  /**
   * (12, 12) (21, 21) (31, 26) (41, 21) (21, 11)
   */

  // draw too small polygon
  label2dList.onMouseMove(new Vector2D(0, 0), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(0, 0), -1, 0)
  label2dList.onMouseUp(new Vector2D(0, 0), -1, 0)
  label2dList.onMouseMove(new Vector2D(0.001, 0), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(0.001, 0), -1, 0)
  label2dList.onMouseUp(new Vector2D(0.001, 0), -1, 0)
  label2dList.onMouseMove(new Vector2D(0, 0.001), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(0, 0.001), -1, 0)
  label2dList.onMouseUp(new Vector2D(0, 0.001), -1, 0)
  label2dList.onMouseMove(new Vector2D(0, 0), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(0, 0), -1, 1)
  label2dList.onMouseUp(new Vector2D(0, 0), -1, 1)
  /**
   * (12, 12) (21, 21) (31, 26) (41, 21) (21, 11)
   * (0, 0) (0.001, 0) (0, 0.001) invalid
   */

  state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(1)
  expect(label2dList.labelList.length).toEqual(1)
})

test('2d polygons drag vertices, midpoints and edges', () => {
  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  Session.dispatch(action.changeSelect({ labelType: 1 }))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })
  const canvasSize = new Size2D(100, 100)
  label2dList.onMouseMove(new Vector2D(1, 1), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(1, 1), -1, 0)
  label2dList.onMouseUp(new Vector2D(1, 1), -1, 0)
  label2dList.onMouseMove(new Vector2D(10, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(10, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(10, 10), -1, 0)
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(20, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(20, 10), -1, 0)
  label2dList.onMouseMove(new Vector2D(10, 0), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(10, 0), -1, 0)
  label2dList.onMouseUp(new Vector2D(10, 0), -1, 0)
  label2dList.onMouseMove(new Vector2D(1, 1), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(1, 1), -1, 1)
  label2dList.onMouseUp(new Vector2D(1, 1), -1, 1)
  /**
   * (1, 1) (10, 10) (20, 10) (10, 0)
   */

  // drag vertex
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, 0, 5)
  label2dList.onMouseDown(new Vector2D(20, 10), 0, 5)
  label2dList.onMouseMove(new Vector2D(30, 10), canvasSize, 0, 5)
  label2dList.onMouseUp(new Vector2D(30, 10), 0, 5)
  let state = Session.getState()
  let polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points[2].x).toEqual(30)
  expect(polygon.points[2].y).toEqual(10)
  expect(polygon.points[2].type).toEqual('vertex')
  /**
   * (1, 1) (10, 10) (30, 10) (10, 0)
   */

  // drag midpoints
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, 0, 4)
  label2dList.onMouseDown(new Vector2D(20, 10), 0, 4)
  label2dList.onMouseMove(new Vector2D(20, 15), canvasSize, 0, 5)
  label2dList.onMouseUp(new Vector2D(20, 15), 0, 5)
  state = Session.getState()
  polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points[2].x).toEqual(20)
  expect(polygon.points[2].y).toEqual(15)
  expect(polygon.points[2].type).toEqual('vertex')
  expect(polygon.points.length).toEqual(5)
  /**
   * (1, 1) (10, 10) (20, 15) (30, 10) (10, 0)
   */

  // drag edges
  label2dList.onMouseMove(new Vector2D(2, 2), canvasSize, 0, 0)
  label2dList.onMouseDown(new Vector2D(2, 2), 0, 0)
  label2dList.onMouseMove(new Vector2D(12, 12), canvasSize, 0, 0)
  label2dList.onMouseUp(new Vector2D(12, 12), 0, 0)
  state = Session.getState()
  polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points[0].x).toEqual(11)
  expect(polygon.points[0].y).toEqual(11)
  expect(polygon.points[0].type).toEqual('vertex')
  expect(polygon.points.length).toEqual(5)
  /**
   * (11, 11) (20, 20) (30, 25) (40, 20) (20, 10)
   */
})

test('2d polygons delete vertex and draw bezier curve', () => {
  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  Session.dispatch(action.changeSelect({ labelType: 1 }))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })
  const canvasSize = new Size2D(100, 100)
  label2dList.onMouseMove(new Vector2D(20, 10), canvasSize, -1, 0)
  label2dList.onMouseUp(new Vector2D(20, 10), -1, 0)
  label2dList.onMouseDown(new Vector2D(20, 10), -1, 0)
  label2dList.onKeyDown(new KeyboardEvent('keydown', { key: 'd' }))
  label2dList.onKeyUp(new KeyboardEvent('keyup', { key: 'd' }))
  label2dList.onMouseMove(new Vector2D(25, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(25, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(25, 10), -1, 0)
  label2dList.onMouseMove(new Vector2D(30, 0), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(30, 0), -1, 0)
  label2dList.onMouseUp(new Vector2D(30, 0), -1, 0)
  label2dList.onMouseMove(new Vector2D(35, 10), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(35, 10), -1, 0)
  label2dList.onMouseUp(new Vector2D(35, 10), -1, 0)
  label2dList.onMouseMove(new Vector2D(30, 20), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(30, 20), -1, 0)
  label2dList.onMouseUp(new Vector2D(30, 20), -1, 0)
  label2dList.onMouseMove(new Vector2D(32, 13), canvasSize, -1, 0)
  label2dList.onKeyDown(new KeyboardEvent('keydown', { key: 'd' }))
  label2dList.onKeyUp(new KeyboardEvent('keyup', { key: 'd' }))
  label2dList.onMouseDown(new Vector2D(32, 13), -1, 0)
  label2dList.onMouseUp(new Vector2D(32, 13), -1, 0)
  label2dList.onMouseMove(new Vector2D(30, 15), canvasSize, -1, 0)
  label2dList.onMouseDown(new Vector2D(30, 15), -1, 0)
  label2dList.onMouseUp(new Vector2D(30, 15), -1, 0)
  label2dList.onMouseMove(new Vector2D(25, 10), canvasSize, -1, 1)
  label2dList.onMouseDown(new Vector2D(25, 10), -1, 1)
  label2dList.onMouseUp(new Vector2D(25, 10), -1, 1)
  /**
   * (25, 10) (30, 0) (35, 10) (32, 13) (30, 15)
   */

  // delete vertex when drawing
  let state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(1)
  expect(label2dList.labelList.length).toEqual(1)

  let polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points.length).toEqual(5)
  expect(polygon.points[0].x).toEqual(25)
  expect(polygon.points[0].y).toEqual(10)
  expect(polygon.points[0].type).toEqual('vertex')
  expect(polygon.points[1].x).toEqual(30)
  expect(polygon.points[1].y).toEqual(0)
  expect(polygon.points[1].type).toEqual('vertex')
  expect(polygon.points[2].x).toEqual(35)
  expect(polygon.points[2].y).toEqual(10)
  expect(polygon.points[2].type).toEqual('vertex')
  expect(polygon.points[3].x).toEqual(32)
  expect(polygon.points[3].y).toEqual(13)
  expect(polygon.points[3].type).toEqual('vertex')
  expect(polygon.points[4].x).toEqual(30)
  expect(polygon.points[4].y).toEqual(15)
  expect(polygon.points[4].type).toEqual('vertex')
  /**
   * (25, 10) (30, 0) (35, 10) (32, 13) (30, 15)
   */

  // delete vertex when closed
  label2dList.onKeyDown(new KeyboardEvent('keydown', { key: 'd' }))
  label2dList.onMouseMove(new Vector2D(27.5, 12.5), canvasSize, 0, 10)
  label2dList.onMouseDown(new Vector2D(27.5, 12.5), 0, 10)
  label2dList.onMouseUp(new Vector2D(27.5, 12.5), 0, 0)
  label2dList.onMouseMove(new Vector2D(30, 15), canvasSize, 0, 9)
  label2dList.onMouseDown(new Vector2D(30, 15), 0, 9)
  label2dList.onMouseUp(new Vector2D(30, 15), 0, 9)
  label2dList.onKeyUp(new KeyboardEvent('keyup', { key: 'd' }))
  /**
   * (25, 10) (30, 0) (35, 10) (32, 13)
   */
  state = Session.getState()
  polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points.length).toEqual(4)
  expect(polygon.points[3].x).toEqual(32)
  expect(polygon.points[3].y).toEqual(13)
  expect(polygon.points[3].type).toEqual('vertex')

  // draw bezier curve
  label2dList.onKeyDown(new KeyboardEvent('keydown', { key: 'c' }))
  label2dList.onMouseMove(new Vector2D(33.5, 11.5), canvasSize, 0, 6)
  label2dList.onMouseDown(new Vector2D(33.5, 12.5), 0, 6)
  label2dList.onMouseUp(new Vector2D(33.5, 11.5), 0, 0)
  label2dList.onKeyUp(new KeyboardEvent('keyup', { key: 'c' }))
  /**
   * (25, 10) (30, 0) (35, 10) | (34, 11) (33, 12) | (32, 13)
   */
  state = Session.getState()
  polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points.length).toEqual(6)
  expect(polygon.points[3].x).toEqual(34)
  expect(polygon.points[3].y).toEqual(11)
  expect(polygon.points[3].type).toEqual('bezier')
  expect(polygon.points[4].x).toEqual(33)
  expect(polygon.points[4].y).toEqual(12)
  expect(polygon.points[4].type).toEqual('bezier')

  label2dList.onMouseMove(new Vector2D(34, 11), canvasSize, 0, 6)
  label2dList.onMouseDown(new Vector2D(34, 11), 0, 6)
  label2dList.onMouseMove(new Vector2D(34, 9), canvasSize, 0, 6)
  label2dList.onMouseUp(new Vector2D(34, 9), 0, 6)
  /**
   * (25, 10) (30, 0) (35, 10) | (34, 9) (33, 12) | (32, 13)
   */
  state = Session.getState()
  polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points.length).toEqual(6)
  expect(polygon.points[2].x).toEqual(35)
  expect(polygon.points[2].y).toEqual(10)
  expect(polygon.points[2].type).toEqual('vertex')
  expect(polygon.points[3].x).toEqual(34)
  expect(polygon.points[3].y).toEqual(9)
  expect(polygon.points[3].type).toEqual('bezier')
  expect(polygon.points[4].x).toEqual(33)
  expect(polygon.points[4].y).toEqual(12)
  expect(polygon.points[4].type).toEqual('bezier')

  // delete vertex on bezier curve
  label2dList.onKeyDown(new KeyboardEvent('keydown', { key: 'd' }))
  label2dList.onMouseMove(new Vector2D(35, 10), canvasSize, 0, 5)
  label2dList.onMouseDown(new Vector2D(35, 10), 0, 5)
  label2dList.onMouseUp(new Vector2D(35, 10), 0, 5)
  label2dList.onKeyUp(new KeyboardEvent('keyup', { key: 'd' }))
  /**
   * (25, 10) (30, 0) (32, 13)
   */
  state = Session.getState()
  polygon = getShape(state, 0, 0, 0) as PolygonType
  expect(polygon.points.length).toEqual(3)
})

// todo test for link

test('Draw label2d list to canvas', () => {
  const labelCanvas = createCanvas(200, 200)
  const labelContext = labelCanvas.getContext('2d')
  const controlCanvas = createCanvas(200, 200)
  const controlContext = controlCanvas.getContext('2d')

  Session.devMode = false
  initStore(testJson)
  const itemIndex = 0
  Session.dispatch(action.goToItem(itemIndex))
  const label2dList = new Label2DList()
  Session.subscribe(() => {
    label2dList.updateState(Session.getState(),
      Session.getState().user.select.item)
  })

  // Draw first box
  const canvasSize = new Size2D(100, 100)
  label2dList.onMouseDown(new Vector2D(1, 1), -1, 0)
  for (let i = 1; i <= 10; i += 1) {
    label2dList.onMouseMove(new Vector2D(i, i), canvasSize, -1, 0)
    label2dList.redraw(labelContext, controlContext, 1)
  }
  label2dList.onMouseUp(new Vector2D(10, 10), -1, 0)
  label2dList.redraw(labelContext, controlContext, 1)

  const state = Session.getState()
  expect(_.size(state.task.items[0].labels)).toEqual(1)
  const rect = getShape(state, 0, 0, 0) as RectType
  expect(rect.x1).toEqual(1)
  expect(rect.y1).toEqual(1)
  expect(rect.x2).toEqual(10)
  expect(rect.y2).toEqual(10)
})
