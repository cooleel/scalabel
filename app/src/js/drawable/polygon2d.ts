import _ from 'lodash'
import { LabelTypes } from '../common/types'
// import { changeLabelShape } from '../action/common'
// import { addPolygon2dLabel } from '../action/Polygon2d'
// import * as labels from '../common/label_types'
// import Session from '../common/session'
import { makeLabel } from '../functional/states'
import { ShapeType, State } from '../functional/types'
import { Size2D } from '../math/size2d'
import { Vector2D } from '../math/vector2d'
import { EdgePoint2D, PointType } from './edge_point2d'
import { DrawMode, Label2D } from './label2d'
import { Context2D, getColorById } from './util'

// const DEFAULT_VIEW_EDGE_STYLE = makeEdge2DStyle({ lineWidth: 4 })
// const DEFAULT_VIEW_POINT_STYLE = makeEdgePoint2DStyle({ radius: 8 })
// const DEFAULT_VIEW_HIGH_POINT_STYLE = makeEdgePoint2DStyle({ radius: 12 })
// const DEFAULT_CONTROL_EDGE_STYLE = makeEdge2DStyle({ lineWidth: 10 })
// const DEFAULT_CONTROL_POINT_STYLE = makeEdgePoint2DStyle({ radius: 12 })

/** list all states */
enum Polygon2DState {
  Free,
  Draw,
  Closed,
  Reshape,
  Move,
  Link
}

/**
 * polygon 2d label
 */
export class Polygon2D extends Label2D {
  /** array for vertices */
  private _points: EdgePoint2D[]
  /** polygon label state */
  private _state: Polygon2DState
  /** mouse position */
  private _mouseCoord: Vector2D
  constructor () {
    super()
    this._points = []
    this._state = Polygon2DState.Free
    this._mouseCoord = new Vector2D()
  }

  /**
   * Draw the label on viewing or control canvas
   * @param _context
   * @param _ratio
   * @param _mode
   */
  public draw (_context: Context2D, _ratio: number, _mode: DrawMode): void {
    // todo draw
    // return
    const self = this
    // if (self._points.length === 0) return
    // let pointStyle = makeEdgePoint2DStyle()
    // let highPointStyle = makeEdgePoint2DStyle()
    // let edgeStyle = makeEdge2DStyle()
    // let assignColor: (i: number) => number[] = () => [0]
    // switch (mode) {
    //   case DrawMode.VIEW:
    //     pointStyle = _.assign(pointStyle, DEFAULT_VIEW_POINT_STYLE)
    //     highPointStyle = _.assign(highPointStyle, DEFAULT_VIEW_HIGH_POINT_STYLE)
    //     edgeStyle = _.assign(edgeStyle, DEFAULT_VIEW_EDGE_STYLE)
    //     assignColor = (_i: number): number[] => {
    //       return self._color
    //     }
    //     break
    //   case DrawMode.CONTROL:
    //     pointStyle = _.assign(pointStyle, DEFAULT_CONTROL_POINT_STYLE)
    //     highPointStyle = _.assign(
    //       highPointStyle, DEFAULT_CONTROL_POINT_STYLE)
    //     edgeStyle = _.assign(edgeStyle, DEFAULT_CONTROL_EDGE_STYLE)
    //     assignColor = (i: number): number[] => {
    //       return encodeControlColor(self._index, i)
    //     }
    //     break
    // }

    // // tslint:disable-next-line: no-console
    // console.log('enter the draw edges')
    // edgeStyle.color = assignColor(0)

    _context.beginPath()
    const beginPoint = self._points[0].clone().scale(_ratio)
    _context.moveTo(beginPoint.x, beginPoint.y)
    _context.moveTo(this._mouseCoord.x, this._mouseCoord.y)
    // for (const edge of self._edges) {
    //   edge.draw(context, ratio, edgeStyle)
    // }
    // if (self._state !== Polygon2DState.Free &&
    //   self._state !== Polygon2DState.Draw) {
    //   new Edge2D(self._points[self._points.length - 1],
    //     self._points[0], EdgeType.line)
    //   .draw(context, ratio, edgeStyle)
    //   context.closePath()
    //   context.fillStyle = 'rgba(100,150,185,0.5)'
    //   context.fill()
    // }

    // if (mode === DrawMode.CONTROL || self._selected || self._highlighted) {
    //   if (self._state === Polygon2DState.Draw) {
    //     // tslint:disable-next-line: no-console
    //     console.log('enter the draw states')
    //     const tmpPoint = new EdgePoint2D(
    //       self._mouseCoord.x, self._mouseCoord.y, PointType.vertex)
    //     new Edge2D(self._points[self._points.length - 1],
    //         tmpPoint, EdgeType.line)
    //      .draw(context, ratio, edgeStyle)
    //     new Edge2D(tmpPoint, self._points[0], EdgeType.line)
    //      .draw(context, ratio, edgeStyle)

    //     context.closePath()
    //     context.fillStyle = 'rgba(100,150,185,0.5)'
    //     context.fill()

    //     for (let i = 0; i < self._points.length; ++i) {
    //       pointStyle.color = assignColor(i + 1)
    //       self._points[i].draw(context, ratio, pointStyle)
    //     }
    //     pointStyle.color = assignColor(self._points.length + 1)
    //     tmpPoint.draw(context, ratio, pointStyle)
    //   } else if (self._state === Polygon2DState.Closed) {
    //     new Edge2D(self._points[self._points.length - 1],
    //       self._points[0], EdgeType.line)
    //     .draw(context, ratio, edgeStyle)

    //     context.closePath()
    //     context.fillStyle = 'rgba(100,150,185,0.5)'
    //     context.fill()

    //     for (let i = 0; i < self._points.length; ++i) {
    //       pointStyle.color = assignColor(i + 1)
    //       self._points[i].draw(context, ratio, pointStyle)
    //     }
    //   }
    // }
  }

  /**
   * reshape the polygon: drag vertex or control points
   * @param _end
   * @param _limit
   */
  public reshape (_end: Vector2D, _limit: Size2D): void {
    // todo: write reshape part
    return
  }

  /**
   * Move the polygon
   * @param _end
   * @param _limit
   */
  public move (_end: Vector2D, _limit: Size2D): void {
    // todo: move polygon
    return
  }

  /**
   * add a new vertex to polygon label
   * it will return whether it is closed
   * @param _coord
   * @param _limit
   */
  public newVertex (_coord: Vector2D): boolean {
    // todo: add a new vertex

    if (this._points.length === 0) { // the first point
      const newPoint = new EdgePoint2D(_coord.x, _coord.y, PointType.vertex)
      this._points.push(newPoint)
      // console.log('end 0 points adding')
    } else if (
      Math.abs(_coord.x - this._points[0].x)
       * Math.abs(_coord.y - this._points[0].y) < 10) {
      // console.log('enter change state to closed')
      this._state = Polygon2DState.Closed
      this.editing = false
    } else {
      // const newPoint = new EdgePoint2D(_coord.x, _coord.y, PointType.vertex)
      // this._edges.push(new Edge2D(this._points[this._points.length - 1],
      //    newPoint, EdgeType.line))
      this._points.push(new EdgePoint2D(_coord.x, _coord.y, PointType.vertex))
    }
    return true
  }

  /**
   * Handle mouse down
   * @param coord
   */
  public onMouseDown (coord: Vector2D): boolean {
    this._mouseDown = true
    this._mouseCoord = coord.clone()
    if (this._selected) {
      this._mouseDownCoord = coord.clone()
      if (this._state === Polygon2DState.Closed && this._selectedHandle < 0) {
        return true
      } else if (this._state === Polygon2DState.Closed &&
        this._selectedHandle > 0) {
        this._state = Polygon2DState.Reshape
        this.editing = true
        // todo: for midpoint
        return true
      } else if (this._state === Polygon2DState.Closed &&
        this._selectedHandle === 0) {
        this._state = Polygon2DState.Move
        this.editing = true
        return true
      }
      return true
    }
    return false
  }

  /**
   * Handle mouse move
   * @param coord
   * @param _limit
   */
  public onMouseMove (coord: Vector2D, _limit: Size2D): boolean {
    if (this._mouseDown === false && this._state === Polygon2DState.Draw) {
      this._mouseCoord = coord.clone()
    } else if (this._mouseDown === true &&
      this._state === Polygon2DState.Reshape) {
      this.reshape(coord, _limit)
    } else if (this._mouseDown === true &&
      this._state === Polygon2DState.Move) {
      this.move(coord, _limit)
    }
    return true
  }

  /**
   * Handle mouse up
   * @param coord
   */
  public onMouseUp (coord: Vector2D): boolean {
    this._mouseCoord = coord.clone()
    if (this.editing === true &&
      this._state === Polygon2DState.Draw) {
      const isClosed = this.newVertex(coord)
      if (isClosed) {
        this._state = Polygon2DState.Closed
        this.editing = false
      }
    } else if (this.editing === true &&
      this._state === Polygon2DState.Reshape) {
      this._state = Polygon2DState.Closed
      this.editing = false
    } else if (this.editing === true &&
      this._state === Polygon2DState.Move) {
      this._state = Polygon2DState.Closed
      this.editing = false
    }
    this._mouseDown = false
    return this.commitLabel()
  }

  /**
   * finish one operation and whether add new label, save changes
   */
  public commitLabel (): boolean {
    const valid = this.isValid()
    if (!this._label || (!valid && !this.editing)) {
      return false
    }
    if (!this.editing) {
      // todo dispatch
      return true
    }
    return true
  }

  /**
   * create new polygon label
   * @param _state
   * @param _start
   */
  public initTemp (state: State, _start: Vector2D): void {
    this.editing = true
    this._state = Polygon2DState.Draw
    const itemIndex = state.user.select.item
    this._order = state.task.status.maxOrder + 1
    this._label = makeLabel({
      type: LabelTypes.POLYGON_2D, id: -1, item: itemIndex,
      category: [state.user.select.category],
      order: this._order
    })
    this._labelId = -1
    this._color = getColorById(state.task.status.maxLabelId + 1)
    this.setSelected(true, 1)
  }

  /**
   * to update the shape of polygon
   * @param _shapes
   */
  public updateShapes (_shapes: ShapeType[]): void {
    // todo load from redux
    return
  }

  /**
   * to check whether the label is valid
   */
  public isValid (): boolean {
    // todo judge
    return true
  }
}
