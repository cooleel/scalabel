import _ from 'lodash'
import { sprintf } from 'sprintf-js'
import { changeLabelShape } from '../action/common'
import { addPolygon2dLabel } from '../action/polygon2d'
import Session from '../common/session'
import { LabelTypes } from '../common/types'
import { makeLabel, makePolygon } from '../functional/states'
import { PathPoint2DType, PolygonType, ShapeType, State } from '../functional/types'
import { Size2D } from '../math/size2d'
import { Vector2D } from '../math/vector2d'
import { DrawMode, Label2D } from './label2d'
import { makeEdge2DStyle, makePathPoint2DStyle, PathPoint2D, PointType } from './path_point2d'
import { Context2D, encodeControlColor, getColorById, toCssColor } from './util'

const DEFAULT_VIEW_EDGE_STYLE = makeEdge2DStyle({ lineWidth: 4 })
const DEFAULT_VIEW_POINT_STYLE = makePathPoint2DStyle({ radius: 8 })
const DEFAULT_VIEW_HIGH_POINT_STYLE = makePathPoint2DStyle({ radius: 12 })
const DEFAULT_CONTROL_EDGE_STYLE = makeEdge2DStyle({ lineWidth: 10 })
const DEFAULT_CONTROL_POINT_STYLE = makePathPoint2DStyle({ radius: 12 })
const DEFAULT_CONTROL_HIGH_POINT_STYLE = makePathPoint2DStyle({ radius: 14 })

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
  private _points: PathPoint2D[]
  /** polygon label state */
  private _state: Polygon2DState
  /** mouse position */
  private _mouseCoord: Vector2D
  /** cache shape points for moving */
  private _startingPoints: PathPoint2D[]
  constructor () {
    super()
    this._points = []
    this._state = Polygon2DState.Free
    this._mouseCoord = new Vector2D()
    this._startingPoints = []
  }

  /**
   * Draw the label on viewing or control canvas
   * @param _context
   * @param _ratio
   * @param _mode
   */
  public draw (context: Context2D, ratio: number, mode: DrawMode): void {
    const self = this

    if (self._points.length === 0) return
    let pointStyle = makePathPoint2DStyle()
    let highPointStyle = makePathPoint2DStyle()
    let edgeStyle = makeEdge2DStyle()
    let assignColor: (i: number) => number[] = () => [0]
    switch (mode) {
      case DrawMode.VIEW:
        pointStyle = _.assign(pointStyle, DEFAULT_VIEW_POINT_STYLE)
        highPointStyle = _.assign(highPointStyle,
          DEFAULT_VIEW_HIGH_POINT_STYLE)
        edgeStyle = _.assign(edgeStyle, DEFAULT_VIEW_EDGE_STYLE)
        assignColor = (_i: number): number[] => {
          return self._color
        }
        break
      case DrawMode.CONTROL:
        pointStyle = _.assign(pointStyle, DEFAULT_CONTROL_POINT_STYLE)
        highPointStyle = _.assign(
          highPointStyle, DEFAULT_CONTROL_HIGH_POINT_STYLE)
        edgeStyle = _.assign(edgeStyle, DEFAULT_CONTROL_EDGE_STYLE)
        assignColor = (i: number): number[] => {
          return encodeControlColor(self._index, i)
        }
        break
    }

    edgeStyle.color = assignColor(0)
    context.save()
    context.strokeStyle = toCssColor(edgeStyle.color)
    context.lineWidth = edgeStyle.lineWidth
    context.beginPath()
    const begin = self._points[0].clone().scale(ratio)
    context.moveTo(begin.x, begin.y)
    for (let i = 1; i < self._points.length; ++i) {
      const point = self._points[i].clone().scale(ratio)
      if (point.type === PointType.mid) continue
      else if (point.type === PointType.bezier) {
        // to do bezier draw
        continue
      } else {
        context.lineTo(point.x, point.y)
      }
    }

    if (self._state === Polygon2DState.Draw) {
      const tmp = self._mouseCoord.clone().scale(ratio)
      context.lineTo(tmp.x, tmp.y)
      context.lineTo(begin.x, begin.y)
    } else {
      context.lineTo(begin.x, begin.y)
    }
    context.closePath()
    context.stroke()

    if (mode === DrawMode.VIEW) {
      const fillStyle = self._color.concat([0.3])
      context.fillStyle = toCssColor(fillStyle)
      context.fill()
      context.restore()
    }

    if (mode === DrawMode.CONTROL || self._selected || self._highlighted) {
      if (self._state === Polygon2DState.Draw) {
        const tmpPoint = new PathPoint2D(self._mouseCoord.x, self._mouseCoord.y)
        const tmpStyle = pointStyle
        tmpStyle.color = assignColor(self._points.length + 1)
        tmpPoint.draw(context, ratio, tmpStyle)
        let vertexNum = 1
        for (const point of self._points) {
          if (point.type === PointType.vertex) {
            let style = pointStyle
            if (vertexNum === self._highlightedHandle) {
              style = highPointStyle
            }
            style.color = assignColor(vertexNum)
            point.draw(context, ratio, style)
            vertexNum++
          }
        }
      } else if (self._state === Polygon2DState.Closed) {
        for (let i = 0; i < self._points.length; ++i) {
          const point = self._points[i]
          let style = pointStyle
          if (point.type === PointType.vertex) {
            if (i + 1 === self._highlightedHandle) {
              style = highPointStyle
            }
          }
          if (point.type === PointType.mid) {
            if (i + 1 === self._highlightedHandle) {
              style = highPointStyle
            }
          }
          style.color = assignColor(i + 1)
          point.draw(context, ratio, style)
        }
      }
    }
  }

  /**
   * reshape the polygon: drag vertex or control points
   * @param _end
   * @param _limit
   */
  public reshape (end: Vector2D, _limit: Size2D): void {
    if (this._selectedHandle <= 0) {
      throw new Error(sprintf('not operation reshape'))
    }
    const point = this._points[this._selectedHandle - 1]
    const x = end.clone().x
    const y = end.clone().y
    point.x = x
    point.y = y
    if (point.type === PointType.vertex) {
      if (this._selectedHandle === 1) {
        const prevPoint = this._points[this._points.length - 2]
        const nextPoint = this._points[2]
        this._points[1] = this.getMidpoint(point, nextPoint)
        this._points[this._points.length - 1] =
          this.getMidpoint(prevPoint, point)
      } else if (this._selectedHandle === this._points.length - 1) {
        const prevPoint = this._points[this._selectedHandle - 3]
        const nextPoint = this._points[0]
        this._points[this._selectedHandle - 2] =
          this.getMidpoint(prevPoint, point)
        this._points[this._selectedHandle] =
          this.getMidpoint(point, nextPoint)
      } else {
        const prevPoint = this._points[this._selectedHandle - 3]
        const nextPoint = this._points[this._selectedHandle + 1]
        this._points[this._selectedHandle - 2] =
          this.getMidpoint(prevPoint, point)
        this._points[this._selectedHandle] =
          this.getMidpoint(point, nextPoint)
      }
    }
  }

  /**
   * Move the polygon
   * @param _end
   * @param _limit
   */
  public move (end: Vector2D, _limit: Size2D): void {
    if (this._selectedHandle !== 0) {
      throw new Error(sprintf('not operation move'))
    }
    const delta = end.clone().subtract(this._mouseDownCoord)
    for (let i = 0; i < this._points.length; ++i) {
      this._points[i].x = this._startingPoints[i].x + delta.x
      this._points[i].y = this._startingPoints[i].y + delta.y
    }
  }

  /**
   * add a new vertex to polygon label
   * it will return whether it is closed
   * @param _coord
   * @param _limit
   */
  public addVertex (_coord: Vector2D): boolean {
    if (this._points.length === 0) {
      const newPoint = new PathPoint2D(_coord.x, _coord.y, PointType.vertex)
      this._points.push(newPoint)
    } else if (
      this._highlightedHandle === 1) {
      const firstPoint = this._points[0]
      const lastPoint = this._points[this._points.length - 1]
      const midPoint = this.getMidpoint(firstPoint, lastPoint)
      this._points.push(midPoint)
      return true
    } else {
      const lastPoint = this._points[this._points.length - 1]
      const midPoint = this.getMidpoint(lastPoint, _coord)
      this._points.push(midPoint)
      this._points.push(new PathPoint2D(_coord.x, _coord.y, PointType.vertex))
    }
    return false
  }

  /**
   * return the midpoint of the line
   * @param prev the previous vertex
   * @param next the next vertex
   */
  public getMidpoint (prev: Vector2D, next: Vector2D): PathPoint2D {
    return new PathPoint2D(
      (prev.x + next.x) / 2, (prev.y + next.y) / 2, PointType.mid)
  }

  /**
   * convert a midpoint to a vertex
   */
  public midToVertex (): void {
    const point = this._points[this._selectedHandle - 1]
    if (point.type !== PointType.mid) {
      throw new Error(sprintf('not a midpoint'))
    }
    const prevPoint = this._points[this._selectedHandle - 2]
    if (this._selectedHandle === this._points.length) {
      const nextPoint = this._points[0]
      const firstMid = this.getMidpoint(prevPoint, point)
      const secondMid = this.getMidpoint(point, nextPoint)
      this._points.splice(this._selectedHandle - 1, 0, firstMid)
      this._points.push(secondMid)
    } else {
      const nextPoint = this._points[this._selectedHandle]
      const firstMid = this.getMidpoint(prevPoint, point)
      const secondMid = this.getMidpoint(point, nextPoint)
      this._points.splice(this._selectedHandle - 1, 0, firstMid)
      this._points.splice(this._selectedHandle + 1, 0, secondMid)
    }
    point.type = PointType.vertex
    this._selectedHandle++
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
        this._startingPoints = []
        for (const point of this._points) {
          this._startingPoints.push(point.clone())
        }
        if (this._points[this._selectedHandle - 1].type === PointType.mid) {
          this.midToVertex()
        }
        return true
      } else if (this._state === Polygon2DState.Closed &&
        this._selectedHandle === 0) {
        this._state = Polygon2DState.Move
        this.editing = true
        this._startingPoints = []
        for (const point of this._points) {
          this._startingPoints.push(point.clone())
        }
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
  public onMouseMove (coord: Vector2D, _limit: Size2D,
                      labelIndex: number, handleIndex: number): boolean {
    if (this._state === Polygon2DState.Draw) {
      this._mouseCoord = coord.clone()
      if (labelIndex === this._index) {
        this._highlightedHandle = handleIndex
      }
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
      const isClosed = this.addVertex(coord)
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
   * convert this drawable polygon to a polygon state
   */
  public toPolygon (): PolygonType {
    const pathPoints: PathPoint2DType[] = new Array()
    for (const point of this._points) {
      pathPoints.push(point.toPathPoint())
    }
    return makePolygon({ points: pathPoints })
  }

  /**
   * finish one operation and whether add new label, save changes
   */
  public commitLabel (): boolean {
    const valid = this.isValid()
    if (!this._label || (!valid && !this.editing)) {
      if (this.labelId === -1) {
        return false
      }
      this._points = []
      for (const point of this._startingPoints) {
        this._points.push(point)
      }
      return true
    }
    if (!this.editing) {
      if (this._labelId < 0) {
        const p = this.toPolygon()
        Session.dispatch(addPolygon2dLabel(
          this._label.item, this._label.category, p.points))
      } else {
        const p = this.toPolygon()
        Session.dispatch(changeLabelShape(
          this._label.item, this._label.shapes[0], p))
      }
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
  public updateShapes (shapes: ShapeType[]): void {
    if (this._label) {
      const polygon = shapes[0] as PolygonType
      if (!_.isEqual(this.toPolygon, polygon)) {
        this._points = new Array()
        for (const point of polygon.points) {
          switch (point.type) {
            case 'vertex': {
              this._points.push(
                new PathPoint2D(point.x, point.y, PointType.vertex))
              break
            }
            case 'mid': {
              this._points.push(
                new PathPoint2D(point.x, point.y, PointType.mid))
              break
            }
            case 'bezier': {
              this._points.push(
                new PathPoint2D(point.x, point.y, PointType.bezier))
              break
            }
          }
        }
        this._state = Polygon2DState.Closed
      }
    }
  }

  /**
   * to check whether two line segments intersect
   */
  public intersect (a: PathPoint2D[], b: PathPoint2D[]): boolean {
    const firstminx = Math.min(a[0].x, a[1].x)
    const firstmaxx = Math.max(a[0].x, a[1].x)
    const firstminy = Math.min(a[0].y, a[1].y)
    const firstmaxy = Math.max(a[0].y, a[1].y)
    const secondminx = Math.min(b[0].x, b[1].x)
    const secondmaxx = Math.max(b[0].x, b[1].x)
    const secondminy = Math.min(b[0].y, b[1].y)
    const secondmaxy = Math.max(b[0].y, b[1].y)
    if (firstmaxx <= secondminx || firstminx >= secondmaxx ||
      firstmaxy <= secondminy || firstminy >= secondmaxy) {
      return false
    }
    return true
  }

  /**
   * to check whether the label is valid
   */
  public isValid (): boolean {
    const lines: PathPoint2D[][] = []
    let l = 0
    let r = 1
    while (r < this._points.length) {
      if (this._points[r].type === PointType.vertex) {
        lines.push([this._points[l], this._points[r]])
        l = r
      }
      r++
    }
    if (this._state === Polygon2DState.Closed) {
      if (this._points[l].type === PointType.vertex) {
        lines.push([this._points[l], this._points[0]])
      }
    }
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[i][0].x === lines[j][0].x &&
          lines[i][0].y === lines[j][0].y) {
          continue
        }
        if (lines[i][0].x === lines[j][1].x &&
          lines[i][0].y === lines[j][1].y) {
          continue
        }
        if (lines[i][1].x === lines[j][0].x &&
          lines[i][1].y === lines[j][0].y) {
          continue
        }
        if (lines[i][1].x === lines[j][1].x &&
          lines[i][1].y === lines[j][1].y) {
          continue
        }
        if (this.intersect(lines[i], lines[j])) {
          return false
        }
      }
    }
    return true
  }
}