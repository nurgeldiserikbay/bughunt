import { Container, Graphics } from 'pixi.js'

export interface IHealthBar {
	width?: number
	height?: number
	health: number
	color?: string
	y?: number
}

const DEFAULT_OPTIONS = {
	width: 120,
  height: 40,
	color: '#000000',
  y: -200,
}

export class HealthBar extends Container {
	blockWidth: number
	blockHeight: number
	health: number
	color: string
	bgColor: string
	bg: Graphics
	fg: Graphics
	border: Graphics
	borderThickness: number
	borderColor: string

	constructor(options: IHealthBar) {
		super()
		this.blockWidth = options.width || DEFAULT_OPTIONS.width
		this.blockHeight = options.height || DEFAULT_OPTIONS.height
		this.color = options.color || DEFAULT_OPTIONS.color
		this.bgColor = '#fcfc53'
		this.health = options?.health
		this.borderThickness = 5
		this.borderColor = '#ffffff'
		this.y = options.y || DEFAULT_OPTIONS.y
    this.x = this.blockWidth / -2

		this.bg = new Graphics()
		this.bg.rect(0, 0, this.blockWidth, this.blockHeight)
		this.bg.fill(this.bgColor)
		this.addChild(this.bg)

		this.fg = new Graphics()
    this.fg.zIndex = 1
		this.addChild(this.fg)

		this.border = new Graphics()
    this.border.zIndex = 2
		this.border.setStrokeStyle({
			color: this.borderColor,
			width: this.borderThickness,
		})
		this.border.rect(0, 0, this.blockWidth, this.blockHeight)
		this.bg.stroke(this.borderColor)
		this.addChild(this.border)

		this.update(this.health)
	}

	update(health: number) {
		const ratio = Math.max(0, Math.min(1, health / this.health))
		this.fg.clear()
		this.fg.rect(0, 0, this.blockWidth * ratio, this.blockHeight)
		this.fg.fill(this.color)
	}

	destroy() {
		this.bg.destroy()
		this.fg.destroy()
		this.border.destroy()
		super.destroy()
	}
}
