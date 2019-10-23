import _ from 'lodash'
import { LabelTypeName, ShapeTypeName } from '../common/types'
import { ItemExport, LabelExport } from '../functional/bdd_types'
import { makeItem, makeLabel } from '../functional/states'
import { Attribute, IndexedShapeType, ItemType,
  LabelType, ShapeType } from '../functional/types'

/**
 * Converts single exported item to frontend state format
 * @param item the item in export format
 * @param itemInd the item index (relative to task)
 * @param itemId the item id (relative to project)
 * @param attributesNameMap look up an attribute and its index from its name
 * @param attributeValueMap look up an attribute value's index
 * @param categoryNameMap look up a category's index from its name
 */
export function convertItemToImport (
  item: Partial<ItemExport>, itemInd: number, itemId: number,
  attributeNameMap: {[key: string]: [number, Attribute]},
  attributeValueMap: {[key: string]: number},
  categoryNameMap: {[key: string]: number}): ItemType {
  const partialItemImport: Partial<ItemType> = {
    url: item.url,
    index: itemInd,
    id: itemId
  }
  const itemImport = makeItem(partialItemImport)

  const labelsImport: { [key: number]: LabelType } = {}
  const shapesImport: { [key: number]: IndexedShapeType } = {}

  if (item.labels !== undefined) {
    Object.entries(item.labels).forEach(([_ind, label]) => {
      const [labelType, shapeType, shapeData] = getLabelByType(label)

      // if the label has any shapes, import them too
      const shapeIds: number[] = []
      if (shapeData !== null) {
        const shapeImport: IndexedShapeType = {
          id: label.id,
          label: [label.id],
          type: shapeType,
          shape: shapeData
        }
        shapeIds.push(shapeImport.id)
        shapesImport[shapeImport.id] = shapeImport
      }

      const categories: number[] = []
      if (label.category in categoryNameMap) {
        categories.push(categoryNameMap[label.category])
      }

      const parsedAttributes = parseExportAttributes(
        label.attributes, attributeNameMap, attributeValueMap)

      const partialLabelImport: Partial<LabelType> = {
        id: label.id,
        item: itemInd,
        type: labelType,
        category: categories,
        attributes: parsedAttributes,
        shapes: shapeIds,
        manual: label.manualShape
      }
      const labelImport = makeLabel(partialLabelImport)
      labelsImport[labelImport.id] = labelImport
    })
  }

  itemImport.labels = labelsImport
  itemImport.shapes = shapesImport

  return itemImport
}

/**
 * parses attributes from BDD format (strings)
 * to internal format (index in config's attributes)
 * @param attributesExport the attributes to process
 * @param attributesNameMap look up an attribute and its index from its name
 * @param attributeValueMap look up an attribute value's index
 */
function parseExportAttributes (
  attributesExport: {[key: string]: (string[] | boolean) },
  attributeNameMap: {[key: string]: [number, Attribute]},
  attributeValueMap: {[key: string]: number}):
  {[key: number]: number[] } {
  const labelAttributes: {[key: number]: number[]} = {}
  Object.entries(attributesExport).forEach(([name, attributeList]) => {
    // get the config attribute that matches the exported attribute name
    if (name in attributeNameMap) {
      const [configIndex, currentAttribute] = attributeNameMap[name]
      // load the attribute based on its type
      if (currentAttribute.toolType === 'switch') {
        // boolean attribute case- only two choices, not a list
        let value = 0
        const attributeVal = attributeList as boolean
        if (attributeVal === true) {
          value = 1
        }
        labelAttributes[configIndex] = [value]
      } else if (currentAttribute.toolType === 'list') {
        // list attribute case- can choose multiple values
        const selectedIndices: number[] = []
        const attributeValues = attributeList as string[]
        attributeValues.forEach((value: string) => {
          // get the index of the selected value
          const valueIndex = attributeValueMap[value]
          if (valueIndex !== -1) {
            selectedIndices.push(valueIndex)
          }
        })
        labelAttributes[configIndex] = selectedIndices
      }
    }
  })
  return labelAttributes
}

 /**
  * based on the export format label,
  * get label type, shape type, and shape data
  */
function getLabelByType (
  label: LabelExport): [string, string, ShapeType | null] {
  let shapeType = ShapeTypeName.UNKNOWN
  let labelType = LabelTypeName.EMPTY
  let shapeData = null

  if (label.box2d !== null) {
    shapeType = ShapeTypeName.RECT
    labelType = LabelTypeName.BOX_2D
    shapeData = label.box2d
  } else if (label.poly2d !== null) {
    shapeType = ShapeTypeName.POLYGON_2D
    labelType = LabelTypeName.POLYGON_2D
    shapeData = label.poly2d
  } else if (label.box3d !== null) {
    shapeType = ShapeTypeName.CUBE
    labelType = LabelTypeName.BOX_3D
    shapeData = label.box3d
  }

  return [labelType, shapeType, shapeData]
}
