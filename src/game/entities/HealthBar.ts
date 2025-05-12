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
	color: '#00ff00',
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
	round: number

	constructor(options: IHealthBar) {
		super()
		this.blockWidth = options.width || DEFAULT_OPTIONS.width
		this.blockHeight = options.height || DEFAULT_OPTIONS.height
		this.color = options.color || DEFAULT_OPTIONS.color
		this.bgColor = '#FF5555'
		this.health = options?.health
		this.borderThickness = 1
		this.borderColor = '#ffffff'
		this.round = 4
		this.zIndex = 1000

		this.bg = new Graphics()
		this.bg.roundRect(0, 0, this.blockWidth, this.blockHeight, this.round)
		this.bg.fill(this.bgColor)
		this.addChild(this.bg)

		this.fg = new Graphics()
		this.fg.roundRect(0, 0, this.blockWidth, this.blockHeight, this.round)
		this.fg.fill(this.color)
		this.fg.zIndex = 1
		this.addChild(this.fg)

		this.border = new Graphics()
		this.border.zIndex = 2
		this.border.setStrokeStyle({
			color: this.borderColor,
			width: this.borderThickness,
		})
		this.border.roundRect(0, 0, this.blockWidth, this.blockHeight, this.round)
		this.border.stroke()
		this.addChild(this.border)

		this.update(this.health)
	}

	update(health: number) {
		const ratio = Math.max(0, Math.min(1, health / this.health))
		if (!this.fg) return
		this.fg.width = this.blockWidth * ratio
	}

	destroy() {
		this.bg.destroy()
		this.fg.destroy()
		this.border.destroy()
		super.destroy()
	}
}
