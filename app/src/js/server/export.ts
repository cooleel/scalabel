import { ShapeTypeName } from '../common/types'
import { ItemExport, LabelExport } from '../functional/bdd_types'
import { Attribute, ConfigType, CubeType, ItemType, PolygonType, RectType, State } from '../functional/types'
import { index2str } from './util'

/**
 * converts single item to exportable format
 * @param config
 * @param item
 */
export function convertItemToExport (config: ConfigType,
                                     item: ItemType): ItemExport {
  const itemExport: ItemExport = {
    name: item.url,
    url: item.url,
    videoName: '',
    attributes: {},
    timestamp: config.submitTime,
    index: item.index,
    labels: []
  }
  if (config.itemType === 'video') {
    itemExport.videoName = config.projectName + index2str(item.index)
  }
  const labelExports: LabelExport[] = []
  Object.entries(item.labels).forEach(([_, label]) => {
    const labelExport: LabelExport = {
      id: label.id,
      category: config.categories[label.category[0]],
      attributes: parseLabelAttributes(label.attributes, config.attributes),
      manualShape: label.manual,
      box2d: null,
      poly2d: null,
      box3d: null
    }
    // TODO: fix this to loop over all labels shapes
    // right now it just exports the first one
    if (label.shapes.length > 0) {
      const shapeId = label.shapes[0]
      const indexedShape = item.shapes[shapeId]
      switch (indexedShape.type) {
        case ShapeTypeName.RECT:
          const box2d = indexedShape.shape as RectType
          labelExport.box2d = box2d
          break
        case ShapeTypeName.POLYGON_2D:
          const poly2d = indexedShape.shape as PolygonType
          labelExport.poly2d = poly2d
          break
        case ShapeTypeName.CUBE:
          const poly3d = indexedShape.shape as CubeType
          labelExport.box3d = poly3d
          break
      }
    }
    labelExports.push(labelExport)
  })
  itemExport.labels = labelExports
  return itemExport
}

/**
 * parses attributes into BDD format
 * @param attributes
 */
function parseLabelAttributes (labelAttributes: {[key: number]: number[]},
                               configAttributes: Attribute[]):
  {[key: string]: (string[] | boolean) } {
  const exportAttributes: {[key: string]: (string[] | boolean) } = {}
  Object.entries(labelAttributes).forEach(([key, attributeList]) => {
    const index = parseInt(key, 10)
    const attribute = configAttributes[index]
    if (attribute.toolType === 'list') {
      // list attribute case- check whether each value is applied
      const selectedValues: string[] = []
      attributeList.forEach((valueIndex) => {
        if (valueIndex in attribute.values) {
          selectedValues.push(attribute.values[valueIndex])
        }
      })
      exportAttributes[attribute.name] = selectedValues
    } else if (attribute.toolType === 'switch') {
      // boolean attribute case- should be a single boolean in the list
      let value = false
      if (attributeList.length > 0) {
        const attributeVal = attributeList[0]
        if (attributeVal === 1) {
          value = true
        }
      }
      exportAttributes[attribute.name] = value
    }

  })
  return exportAttributes
}

/**
 * converts state to export format
 * @param state
 */
export function convertState (state: State): ItemExport[] {
  const config = state.task.config
  const items = state.task.items
  const exportList: ItemExport[] = []
  items.forEach((item) => {
    exportList.push(convertItemToExport(config, item))
  })
  return exportList
}
