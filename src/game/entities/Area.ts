import { Container, FederatedPointerEvent, Point, Sprite } from 'pixi.js'

import { I_AreaOpt } from '../consts'
import { IPoint } from '../interfaces'

import Scene from '../Scene'

export class Area {
	scene: Scene
	dragging: boolean
	previousMousePosition: null | Point
	velocity: IPoint
	grid: Container
	mapBounds: {
		left: number
		right: number
		top: number
		bottom: number
	}
	bg: Sprite | undefined
	bgMask: Sprite | undefined

	constructor(scene: Scene) {
		this.scene = scene
		this.dragging = false
		this.previousMousePosition = null
		this.velocity = { x: 0, y: 0 }
		this.grid = new Container()
		this.grid.eventMode = 'static'
		this.mapBounds = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		}
	}

	init() {
		this.grid.on('pointerdown', this.onMouseDown.bind(this))
		this.grid.on('pointerup', this.onMouseUp.bind(this))
		this.grid.on('pointerleave', this.onMouseUp.bind(this))
		this.grid.on('pointermove', this.updateMousePos.bind(this))
	}

	async setArea(option: I_AreaOpt) {
		this.grid.x = (this.scene.app.screen.width - option.width) / 2
		this.grid.y = (this.scene.app.screen.height - option.height) / 2
		this.setMapBounds(option)

		if (this.bg) {
			this.bg.texture = option.texture
		} else {
			this.bg = new Sprite()
			this.bg.texture = option.texture
			this.grid.addChild(this.bg)
		}
		this.bg.width = option.width
		this.bg.height = option.height

		if (this.bgMask) {
			this.bgMask.texture = option.textureMask
		} else {
			this.bgMask = new Sprite()
			this.bgMask.texture = option.textureMask
			this.grid.addChild(this.bgMask)
			this.bgMask.zIndex = 5
		}
		this.bgMask.width = option.width
		this.bgMask.height = option.height
	}

	addChild(child: Sprite | Container) {
		this.grid.addChild(child)
	}

	removeChild(child: Sprite | Container) {
		this.grid.removeChild(child)
	}

	setMapBounds(option: I_AreaOpt) {
		this.mapBounds = {
			left: Math.min(this.scene.app.screen.width - option.width, 0),
			right: Math.max(this.scene.app.screen.width - option.width, 0),
			top: Math.min(this.scene.app.screen.height - option.height, 0),
			bottom: Math.max(this.scene.app.screen.height - option.height, 0),
		}
	}

	onMouseDown(event: FederatedPointerEvent) {
		this.dragging = true
		this.previousMousePosition = event.global.clone()
	}

	onMouseUp() {
		this.dragging = false
	}

	updateMousePos(event: FederatedPointerEvent) {
		if (!this.dragging) return

		const currentMousePosition = event.global.clone()
		const dx = currentMousePosition.x - (this.previousMousePosition?.x || 0)
		const dy = currentMousePosition.y - (this.previousMousePosition?.y || 0)

		this.velocity.x = dx
		this.velocity.y = dy

		this.grid.x += this.velocity.x
		this.grid.y += this.velocity.y

		this.calcOutOfBounds()

		this.previousMousePosition = currentMousePosition
	}

	calcOutOfBounds() {
		if (this.mapBounds.left - this.grid.x > 0) this.grid.x = this.mapBounds.left
		if (this.grid.x - this.mapBounds.right > 0)
			this.grid.x = this.mapBounds.right
		if (this.mapBounds.top - this.grid.y > 0) this.grid.y = this.mapBounds.top
		if (this.grid.y - this.mapBounds.bottom > 0)
			this.grid.y = this.mapBounds.bottom
	}

	updateUI() {
		if (this.velocity.x === 0 && this.velocity.y === 0) return
		if (!this.dragging) {
			this.velocity.x *= 0.95
			this.velocity.y *= 0.95
			this.grid.x += this.velocity.x
			this.grid.y += this.velocity.y
			if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0
			if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0
			this.grid.x = Math.min(
				Math.max(this.grid.x, this.mapBounds.left),
				this.mapBounds.right
			)
			this.grid.y = Math.min(
				Math.max(this.grid.y, this.mapBounds.top),
				this.mapBounds.bottom
			)
		}
	}
}
