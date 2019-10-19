import createStyles from '@material-ui/core/styles/createStyles'
import { withStyles } from '@material-ui/core/styles/index'
import * as React from 'react'
import * as THREE from 'three'
import Session from '../common/session'
import { Label3DList } from '../drawable/3d/label3d_list'
import { getCurrentImageViewerConfig, getCurrentPointCloudViewerConfig, isItemLoaded } from '../functional/state_util'
import { PointCloudViewerConfigType, State } from '../functional/types'
import { MAX_SCALE, MIN_SCALE, updateCanvasScale } from '../view_config/image'
import { convertMouseToNDC, updateThreeCameraAndRenderer } from '../view_config/point_cloud'
import { Viewer } from './viewer'

const styles = () => createStyles({
  label3d_canvas: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  }
})

interface ClassType {
  /** CSS canvas name */
  label3d_canvas: string
}

interface Props {
  /** CSS class */
  classes: ClassType
  /** container */
  display: HTMLDivElement | null
}

/**
 * Normalize mouse coordinates to make canvas left top origin
 * @param x
 * @param y
 * @param canvas
 */
function normalizeCoordinatesToCanvas (
  x: number, y: number, canvas: HTMLCanvasElement): number[] {
  return [
    x - canvas.getBoundingClientRect().left,
    y - canvas.getBoundingClientRect().top
  ]
}

/**
 * Canvas Viewer
 */
class Label3dViewer extends Viewer<Props> {
  /** Canvas to draw on */
  private canvas: HTMLCanvasElement | null
  /** Container */
  private display: HTMLDivElement | null
  /** Current scale */
  private scale: number
  /** ThreeJS Renderer */
  private renderer?: THREE.WebGLRenderer
  /** ThreeJS Scene object */
  private scene: THREE.Scene
  /** ThreeJS Camera */
  private camera: THREE.PerspectiveCamera
  /** ThreeJS sphere mesh for indicating camera target location */
  private target: THREE.Mesh
  /** raycaster */
  private _raycaster: THREE.Raycaster
  /** The hashed list of keys currently down */
  private _keyDownMap: { [key: string]: boolean }

  /** drawable label list */
  private _labels: Label3DList

  /** key up listener */
  private _keyUpListener: (e: KeyboardEvent) => void
  /** key down listener */
  private _keyDownListener: (e: KeyboardEvent) => void

  /**
   * Constructor, ons subscription to store
   * @param {Object} props: react props
   */
  constructor (props: Readonly<Props>) {
    super(props)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    this.target = new THREE.Mesh(
      new THREE.SphereGeometry(0.03),
        new THREE.MeshBasicMaterial({
          color:
            0xffffff
        }))
    this.scene.add(this.target)

    this._labels = new Label3DList()

    this.display = null
    this.canvas = null
    this.scale = 1

    this._raycaster = new THREE.Raycaster()
    this._raycaster.near = 1.0
    this._raycaster.far = 100.0
    this._raycaster.linePrecision = 0.02

    this._keyDownMap = {}

    this._keyUpListener = (e) => { this.onKeyUp(e) }
    this._keyDownListener = (e) => { this.onKeyDown(e) }
  }

  /**
   * Mount callback
   */
  public componentDidMount () {
    document.addEventListener('keydown', this._keyDownListener)
    document.addEventListener('keyup', this._keyUpListener)
  }

  /**
   * Unmount callback
   */
  public componentWillUnmount () {
    document.removeEventListener('keydown', this._keyDownListener)
    document.removeEventListener('keyup', this._keyUpListener)
  }

  /**
   * Render function
   * @return {React.Fragment} React fragment
   */
  public render () {
    const { classes } = this.props

    let canvas = (<canvas
      key='label3d-canvas'
      className={classes.label3d_canvas}
      ref={(ref) => { this.initializeRefs(ref) }}
      onMouseDown={(e) => { this.onMouseDown(e) }}
      onMouseUp={(e) => { this.onMouseUp(e) }}
      onMouseMove={(e) => { this.onMouseMove(e) }}
      onDoubleClick={(e) => { this.onDoubleClick(e) }}
    />)

    if (this.display) {
      const displayRect = this.display.getBoundingClientRect()
      canvas = React.cloneElement(
        canvas,
        { height: displayRect.height, width: displayRect.width }
      )
    }

    return canvas
  }

  /**
   * Handles canvas redraw
   * @return {boolean}
   */
  public redraw (): boolean {
    const state = this.state
    const item = state.user.select.item
    const loaded = state.session.items[item].loaded
    if (loaded) {
      if (this.canvas) {
        this.updateRenderer()
        this.renderThree()
      }
    }
    return true
  }

  /**
   * Handle mouse down
   * @param {React.MouseEvent<HTMLCanvasElement>} e
   */
  public onMouseDown (e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.canvas || this.checkFreeze()) {
      return
    }
    const normalized = normalizeCoordinatesToCanvas(
      e.clientX, e.clientY, this.canvas
    )
    const NDC = convertMouseToNDC(
      normalized[0],
      normalized[1],
      this.canvas
    )
    const x = NDC[0]
    const y = NDC[1]
    if (this._labels.onMouseDown(x, y, this.camera)) {
      e.stopPropagation()
    }
  }

  /**
   * Handle mouse up
   * @param {React.MouseEvent<HTMLCanvasElement>} e
   */
  public onMouseUp (e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.canvas || this.checkFreeze()) {
      return
    }
    if (this._labels.onMouseUp()) {
      e.stopPropagation()
    }
  }

  /**
   * Handle mouse move
   * @param {React.MouseEvent<HTMLCanvasElement>} e
   */
  public onMouseMove (e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.canvas || this.checkFreeze()) {
      return
    }

    const normalized = normalizeCoordinatesToCanvas(
      e.clientX, e.clientY, this.canvas
    )

    const newX = normalized[0]
    const newY = normalized[1]

    const NDC = convertMouseToNDC(
      newX,
      newY,
      this.canvas
    )
    const x = NDC[0]
    const y = NDC[1]

    this._raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)

    const shapes = this._labels.getRaycastableShapes()
    const intersects = this._raycaster.intersectObjects(
      // Need to do this middle conversion because ThreeJS does not specify
      // as readonly, but this should be readonly for all other purposes
      shapes as unknown as THREE.Object3D[], false
    )

    const consumed = (intersects && intersects.length > 0) ?
      this._labels.onMouseMove(x, y, this.camera, intersects[0]) :
      this._labels.onMouseMove(x, y, this.camera)
    if (consumed) {
      e.stopPropagation()
    }

    this.renderThree()
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e
   */
  public onKeyDown (e: KeyboardEvent) {
    if (this.checkFreeze()) {
      return
    }

    this._keyDownMap[e.key] = true

    if (this._labels.onKeyDown(e)) {
      this.renderThree()
    }
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e
   */
  public onKeyUp (e: KeyboardEvent) {
    if (this.checkFreeze()) {
      return
    }

    this._keyDownMap[e.key] = true

    if (this._labels.onKeyUp(e)) {
      this.renderThree()
    }
  }

  /**
   * notify state is updated
   */
  protected updateState (state: State): void {
    this.display = this.props.display
    this._labels.updateState(state, state.user.select.item)
  }

  /**
   * Render ThreeJS Scene
   */
  private renderThree () {
    if (this.renderer) {
      this.scene.children = []
      this._labels.render(this.scene, this.camera)
      this.renderer.render(this.scene, this.camera)
    }
  }

  /**
   * Handle double click
   * @param _e
   */
  private onDoubleClick (e: React.MouseEvent<HTMLCanvasElement>) {
    if (this._labels.onDoubleClick()) {
      e.stopPropagation()
    }
  }

  /**
   * Set references to div elements and try to initialize renderer
   * @param {HTMLDivElement} component
   * @param {string} componentType
   */
  private initializeRefs (component: HTMLCanvasElement | null) {
    if (!component) {
      return
    }

    if (component.nodeName === 'CANVAS') {
      if (this.canvas !== component) {
        this.canvas = component
        const rendererParams = { canvas: this.canvas, alpha: true }
        this.renderer = new THREE.WebGLRenderer(rendererParams)
      }

      if (this.canvas && this.display) {
        if (Session.itemType === 'image') {
          const config = getCurrentImageViewerConfig(this.state)

          if (config.viewScale < MIN_SCALE || config.viewScale >= MAX_SCALE) {
            return
          }
          const newParams =
            updateCanvasScale(
              this.state,
              this.display,
              this.canvas,
              null,
              config,
              config.viewScale / this.scale,
              false
            )
          this.scale = newParams[3]
        }
      }

      if (isItemLoaded(this.state)) {
        this.updateRenderer()
      }
    }
  }

  /**
   * Update rendering constants
   */
  private updateRenderer () {
    if (this.canvas && this.renderer) {
      const config: PointCloudViewerConfigType = this.getCurrentViewerConfig()
      updateThreeCameraAndRenderer(
        config,
        this.camera,
        this.canvas,
        this.renderer,
        this.target
      )
    }
  }

  /**
   * Get point cloud view config
   */
  private getCurrentViewerConfig (): PointCloudViewerConfigType {
    return (getCurrentPointCloudViewerConfig(this.state))
  }
}

export default withStyles(styles, { withTheme: true })(Label3dViewer)
