import { AnimatedSprite, Container, Spritesheet } from 'pixi.js'

import { BUGS } from '../consts'

import Game from '../Game'

import { Food } from './Food'
import { HealthBar } from './HealthBar'

const SIZE = 100

export class Bug extends Container {
	sprite: AnimatedSprite
	name: string
	game: Game
	health: number
	appetite: number
	speed: number
	intelligence: number
	reactionTime: number
	awareness: number
	wanderAngle: number
	waitTime: number
	eatSpeed: number
	isScared: boolean
	lastMouseCheck: number
	spritesheets: Spritesheet
	state: string
	dieSound: string
	healthBar: HealthBar
	timerDie?: ReturnType<typeof setTimeout>
	timer?: ReturnType<typeof setInterval>

	constructor(optName: string, game: Game) {
		super()
		this.sprite = new AnimatedSprite(game.spritesheets[optName].animations.walk)
		this.sprite.width = SIZE
		this.sprite.height = SIZE
		this.sprite.anchor.set(0.5)
		this.addChild(this.sprite)
		this.name = String(Math.random())
		this.game = game
		this.waitTime = 0
		this.timer = undefined
		this.isScared = false
		this.spritesheets = game.spritesheets[optName]
		this.state = 'walk'

		const opt = BUGS[optName]
		this.sprite.animationSpeed = BUGS[optName].animationSpeed
		this.health = opt.health
		this.appetite = opt.appetite
		this.speed = opt.speed / 2
		this.dieSound = opt.dieSound
		this.eatSpeed = opt.eatSpeed
		this.intelligence = opt.intelligence
		this.reactionTime = 200 - this.intelligence * 150
		this.awareness = (this.intelligence / 2) * Math.random()
		this.wanderAngle = Math.random() * Math.PI * 2
		this.lastMouseCheck = 0

		this.healthBar = new HealthBar({
			width: SIZE * 0.8,
			height: 5,
			health: this.health,
			color: '#fc53ee',
			y: -70,
		})
		this.addChild(this.healthBar)

		this.sprite.play()
		this.setPosition()

		game.bugs.push(this)
		game.area.addChild(this)
		game.scene.addUpdate(this.name, this.move.bind(this))
	}

	move() {
		if (this.state === 'dead') return

		if (this.isScared) {
			this.runAway()
			return
		}

		if (this.waitTime > 0) {
			this.waitTime--
			return
		}

		let currentTime = performance.now()

		if (
			this.intelligence > 0.3 &&
			currentTime - this.lastMouseCheck > this.reactionTime
		) {
			this.lastMouseCheck = currentTime
			this.checkForMouse(this.game.scene.app.renderer.events.pointer)
		}

		const foods = this.game.foods

		let targetFood = this.findBestFood(foods)

		if (targetFood) {
			if (Math.random() < 0.02) {
				this.waitTime = Math.floor(Math.random() * 60)
				this.changeState('idle')
			} else {
				this.moveTowards(targetFood)
			}
		} else {
			if (Math.random() < 0.01) {
				this.waitTime = Math.floor(Math.random() * 60)
				this.changeState('idle')
			} else {
				this.wander()
			}
		}
	}

	findBestFood(foods: Food[]) {
		let bestFood = null
		let bestScore = -Infinity

		for (const food of foods) {
			const dx = food.x - this.x
			const dy = food.y - this.y
			const dist = Math.sqrt(dx * dx + dy * dy)

			const score =
				(food.attractiveness / (dist + 1)) * (0.5 + this.intelligence)

			if (score > bestScore) {
				bestScore = score
				bestFood = food
			}
		}

		return bestFood
	}

	moveTowards(target: Food) {
		const dx = target.x - this.x
		const dy = target.y - this.y
		const dist = Math.sqrt(dx * dx + dy * dy)

		if (dist > target.width + 5) {
			this.x += (dx / dist) * this.speed
			this.y += (dy / dist) * this.speed
			const angle = Math.atan2(dy, dx)
			this.sprite.rotation = angle + Math.PI / 2
			if (this.timer !== undefined) this.stopEating()
			this.changeState('walk')
		} else if (!this.timer && target.health > 0) {
			this.runEating(target)
		}
	}

	runEating(food: Food) {
		this.eat(food)
		this.changeState('idle')
		this.timer = setInterval(() => {
			this.eat(food)
		}, this.eatSpeed)
	}

	eat(food: Food) {
		food.damage(this.appetite)
		if (food.health < 0) this.stopEating()
	}

	wander() {
		this.wanderAngle += (Math.random() - 0.5) * 0.2
		this.x += Math.cos(this.wanderAngle) * this.speed
		this.y += Math.sin(this.wanderAngle) * this.speed
		this.sprite.rotation = this.wanderAngle + Math.PI / 2

		if (this.x < 0) this.x = 0
		if (this.x > this.game.area.grid.width) this.x = this.game.area.grid.width
		if (this.y < 0) this.y = 0
		if (this.y > this.game.area.grid.height) this.y = this.game.area.grid.height
		this.changeState('walk')
	}

	checkForMouse(mousePosition: { x: number; y: number }) {
		const dx = mousePosition.x - this.x
		const dy = mousePosition.y - this.y
		const dist = Math.sqrt(dx * dx + dy * dy)

		if (dist < 80 && Math.random() < this.awareness) {
			this.runAway()
		}
	}

	changeState(state: string) {
		if (this.state === 'dead') return

		if (this.state !== 'idle' && state === 'idle') {
			this.sprite.textures = this.spritesheets.animations.idle
		} else if (this.state !== 'walk' && state === 'walk') {
			this.sprite.textures = this.spritesheets.animations.walk
		} else if (state === 'dead') {
			// this.sprite.textures = this.spritesheets.animations.dead
		}
		this.sprite.play()
		this.state = state
	}

	runAway() {
		const threat = this.game.scene.app.renderer.events.pointer
		const angle = Math.atan2(this.y - threat.y, this.x - threat.x)
		this.sprite.rotation = angle + Math.PI / 2
		this.x += Math.cos(angle) * this.speed * 3
		this.y += Math.sin(angle) * this.speed * 3
		this.sprite.animationSpeed *= 3
		if (!this.isScared) {
			this.changeState('walk')
			setTimeout(() => {
				this.isScared = false
				this.sprite.animationSpeed /= 3
			}, 1000)
		}
		this.isScared = true
	}

	hit(damage: number) {
		this.health -= damage
		this.healthBar.update(this.health)
		if (this.health < 0) {
			this.die()
		}
		else {
			this.runAway()
		}
	}

	die() {
		if (this.state === 'dead') return
		this.changeState('dead')
		this.stopEating()
		this.game.bugDie(this.appetite)
		this.game.createScorePopup(this.x, this.y, this.appetite)
		this.game.bugCalculate()

		this.game.controls.play(this.dieSound)

		// this.timerDie = setTimeout(() => {
		// 	try {
				this.remove()
		// 	} catch (error) {}
		// }, 5000)
	}

	remove() {
		this.game.area.removeChild(this)
		this.game.scene.removeUpdate(this.name)
		this.game.bugs = this.game.bugs.filter((f) => f !== this)
	}

	stopEating() {
		clearInterval(this.timer)
		this.timer = undefined
	}

	setPosition() {
		if (Math.random() > 0.5) {
			if (Math.random() > 0.5) {
				this.y = this.sprite.height / -2
			} else {
				this.y = this.game.area.grid.height + this.sprite.height / 2
			}
			this.x = Math.random() * this.game.area.grid.width
		} else {
			if (Math.random() > 0.5) {
				this.x = this.sprite.width / -2
			} else {
				this.x = this.game.area.grid.width + this.sprite.width / 2
			}
			this.y = Math.random() * this.game.area.grid.height
		}
	}
}
