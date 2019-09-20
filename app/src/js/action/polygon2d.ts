import { LabelTypes, ShapeTypes } from '../common/types'
import { makeLabel, makePolygon } from '../functional/states'
import { PathPoint2DType } from '../functional/types'
// import { Vector2D } from '../math/vector2d'
import * as actions from './common'
import { AddLabelsAction } from './types'

/**
 * Create AddLabelAction to create a polygon2d label
 * @param itemIndex
 * @param category
 * @param points list of the control points
 * @param types list of the type of the control points
 * @return {AddLabelAction}
 */
export function addPolygon2dLabel (
  itemIndex: number, category: number[], points: PathPoint2DType[])
  : AddLabelsAction {
  const polygon = makePolygon({ points })
  const label = makeLabel({ type: LabelTypes.POLYGON_2D, category })
  return actions.addLabel(
    itemIndex, label, [ShapeTypes.POLYGON_2D], [polygon])
}
