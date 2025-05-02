import { AnimatedSprite, Spritesheet } from 'pixi.js'

import { FOODS } from '../consts'

import Game from '../Game'

const SIZE = 120

export class Food extends AnimatedSprite {
	name: string
	game: Game
	health: number
	attractiveness: number
	spritesheets: Spritesheet
	min: { x: number; y: number }
	delta: { x: number; y: number }

	constructor(optName: string, game: Game) {
		super(game.spritesheets[optName].animations.eat)
		this.name = optName
		this.width = SIZE
		this.height = SIZE
		this.anchor.set(0.5)
		this.spritesheets = game.spritesheets[optName]

		const opt = FOODS[optName]
		this.game = game
		this.health = opt.health
		this.attractiveness = opt.attractiveness

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
	}

	damage(damage: number) {
		this.health -= damage

		if (this.health < 0) this.die()
		else if (this.health < 0.3 * FOODS[this.name].health) {
			this.currentFrame = 2
			this.width = SIZE * 0.3
			this.height = SIZE * 0.3
		}
		else if (this.health < 0.6 * FOODS[this.name].health) {
			this.currentFrame = 1
			this.width = SIZE * 0.6
			this.height = SIZE * 0.6
		}

		this.game.foodCalculate()
	}

	die() {
		this.game.area.removeChild(this)
		this.game.foods = this.game.foods.filter((f) => f !== this)
	}

	setPosition() {
		this.x = this.min.x + this.delta.x * Math.random()
		this.y = this.min.y + this.delta.y * Math.random()
	}
}
