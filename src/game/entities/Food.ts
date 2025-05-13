import { AnimatedSprite, Spritesheet, Ticker } from 'pixi.js'

import { FOODS } from '../consts'

import Game from '../Game'

import { HealthBar } from './HealthBar'

const SIZE = {
	width: 60,
	height: 60,
}

export class Food extends AnimatedSprite {
	name: string
	game: Game
	health: number
	attractiveness: number
	spritesheets: Spritesheet
	min: { x: number; y: number }
	delta: { x: number; y: number }
	healthBar: HealthBar
	animationTicker?: Ticker
	initialY: number
	initialWidth: number
	initialHeight: number

	constructor(optName: string, game: Game) {
		super(game.spritesheets[optName].animations.eat)
		this.name = optName
		this.width = SIZE.width
		this.height = SIZE.height
		this.initialWidth = SIZE.width
		this.initialHeight = SIZE.height
		this.anchor.set(0.5)
		this.spritesheets = game.spritesheets[optName]

		const opt = FOODS[optName]
		this.game = game
		this.health = opt.health
		this.attractiveness = opt.attractiveness

		this.healthBar = new HealthBar({
			width: SIZE.width,
			height: 4,
			health: this.health,
			color: '#00ff00',
		})

		game.area.addChild(this.healthBar)

		game.foods.push(this)
		game.area.addChild(this)

		this.min = {
			x: this.game.area.grid.width * 0.2,
			y: this.game.area.grid.height * 0.2,
		}

		this.delta = {
			x: this.game.area.grid.width * 0.6,
			y: this.game.area.grid.height * 0.6,
		}

		this.setPosition()
		this.initialY = this.y
		this.startBounceAnimation()
	}

	startBounceAnimation() {
		this.animationTicker = new Ticker()
		this.animationTicker.add(() => {
			// Плавное подпрыгивание с помощью синуса
			this.y = this.initialY + Math.sin(Date.now() * 0.002) * 3
			// Плавное сжатие/разжатие
			const scale = 1 + Math.sin(Date.now() * 0.003) * 0.02
			this.width = this.initialWidth * scale
			this.height = this.initialHeight * scale
			// Обновляем позицию healthBar вместе с едой
			this.healthBar.y = this.y - this.height / 2 - 20
		})
		this.animationTicker.start()
	}

	damage(damage: number) {
		this.health -= damage

		if (this.health < 0) {
			this.game.foodCalculate()
			this.die()
			return
		} else if (this.health < 0.2 * FOODS[this.name].health) {
			this.currentFrame = 3
		} else if (this.health < 0.4 * FOODS[this.name].health) {
			this.currentFrame = 2
		} else if (this.health < 0.6 * FOODS[this.name].health) {
			this.currentFrame = 1
		} else if (this.health < 0.8 * FOODS[this.name].health) {
			this.currentFrame = 0
		}

		this.healthBar.update(this.health)
		this.game.foodCalculate()
	}

	die() {
		if (this.animationTicker) {
			this.animationTicker.destroy()
			this.animationTicker = undefined
		}
		this.healthBar.destroy()
		this.game.area.removeChild(this.healthBar)
		this.game.area.removeChild(this)
		this.game.foods = this.game.foods.filter((f) => f !== this)
	}

	setPosition() {
		this.x = this.min.x + this.delta.x * Math.random()
		this.y = this.min.y + this.delta.y * Math.random()
		this.initialY = this.y

		this.healthBar.x = this.x - this.width / 2
		this.healthBar.y = this.y - this.height / 2 - 20
	}
}
