import { Point2D } from './point2d'
import { Context2D, toCssColor } from './util'

export enum PointType {
  vertex,
  mid,
  bezier
}

export interface EdgePoint2DStyle {
  /** radius of the point on drawing */
  radius: number
  /** color of the point */
  color: number[]
}

/**
 * Generate EdgePoint2D style with default parameters
 * @param style
 */
export function makeEdgePoint2DStyle (
    style: Partial<EdgePoint2DStyle> = {}): EdgePoint2DStyle {
  return {
    radius: 1,
    color: [0, 0, 0],
    ...style
  }
}

/** points2D for polygon */
export class EdgePoint2D extends Point2D {

  /** point type */
  private _type: PointType

  constructor (
    x: number = 0, y: number = 0, type: PointType = PointType.vertex) {
    super()
    this.x = x
    this.y = y
    this._type = type
  }

  /** get and set type */
  public get type (): PointType {
    return this._type
  }

  public set type (t: PointType) {
    this._type = t
  }

  /**
   * Draw the point on a 2D context
   * @param context
   * @param ratio
   * @param style
   */
  public draw (
    context: Context2D, ratio: number, style: EdgePoint2DStyle): void {
    context.save()
    // convert to display resolution
    const real = this.clone().scale(ratio)
    context.beginPath()
    context.fillStyle = toCssColor(style.color)
    context.arc(real.x, real.y, style.radius, 0, 2 * Math.PI, false)
    context.closePath()
    context.fill()
    context.restore()
  }
}
