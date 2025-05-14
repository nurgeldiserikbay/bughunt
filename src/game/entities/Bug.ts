import { AnimatedSprite, Container, Spritesheet } from 'pixi.js'

import { BUGS } from '../consts'

import Game from '../Game'

import { Food } from './Food'
import { HealthBar } from './HealthBar'

const SIZE = 50

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
	score: number
	eatSpeed: number
	isScared: boolean
	lastMouseCheck: number
	spritesheets: Spritesheet
	state: string
	dieSound: string
	healthBar: HealthBar
	runAwayAngle?: number
	timerDie?: ReturnType<typeof setTimeout>
	timers: {
		[key: string]:
			| ReturnType<typeof setTimeout>
			| ReturnType<typeof setInterval>
	}
	animationSpeed: number

	_lastPos: { x: number; y: number }
	_stuckTime: number

	constructor(optName: string, game: Game) {
		super()
		const opt = BUGS[optName]
		this.sprite = new AnimatedSprite(game.spritesheets[optName].animations.walk)
		this.sprite.width = opt.width
		this.sprite.height = opt.height
		this.sprite.anchor.set(0.5)
		this.addChild(this.sprite)
		this.name = String(Math.random())
		this.game = game
		this.waitTime = 0
		this.isScared = false
		this.spritesheets = game.spritesheets[optName]
		this.state = 'walk'
		this.timers = {}

		this.animationSpeed = BUGS[optName].animationSpeed
		this.sprite.animationSpeed = BUGS[optName].animationSpeed
		this.health = opt.health
		this.appetite = opt.appetite
		this.speed = opt.speed / 2
		this.score = opt.score
		this.dieSound = opt.dieSound
		this.eatSpeed = opt.eatSpeed
		this.intelligence = opt.intelligence
		this.reactionTime = 200 - this.intelligence * 150
		this.awareness = (this.intelligence / 2) * Math.random()
		this.wanderAngle = Math.random() * Math.PI * 2
		this.lastMouseCheck = 0
		this._lastPos = { x: this.x, y: this.y }
		this._stuckTime = 0

		this.healthBar = new HealthBar({
			width: SIZE * 0.8,
			height: 4,
			health: this.health,
			color: '#00ff00',
			y: -70,
		})
		game.area.addChild(this.healthBar)

		this.sprite.play()
		this.setPosition()

		game.bugs.push(this)
		game.area.addChild(this)
		game.scene.addUpdate(this.name, this.move.bind(this))
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

		this.healthBar.updatePosition(this.x, this.y)
	}

	move() {
		if (this.state === 'dead' || this.game.isPaused) return
		if (this.isScared) return this.runAway()
		if (this.waitTime > 0) return this.waitTime--

		let currentTime = performance.now()

		if (
			this.intelligence > 0.3 &&
			currentTime - this.lastMouseCheck > this.reactionTime
		) {
			this.lastMouseCheck = currentTime
			this.checkForMouse(this.game.scene.app.renderer.events.pointer)
		}

		if (!this.isScared) {
			let targetFood = this.findBestFood(this.game.foods)

			if (targetFood) {
				if (Math.random() < 0.02) {
					this.waitTime = Math.floor(Math.random() * 20)
					this.changeState('idle')
				} else {
					this.moveTowards(targetFood)
				}
			} else {
				if (Math.random() < 0.02) {
					this.waitTime = Math.floor(Math.random() * 20)
					this.changeState('idle')
				} else {
					this.wander()
				}
			}
			this.healthBar.updatePosition(this.x, this.y)
		}
	}

	moveTowards(target: Food) {
		const dx = target.x - this.x
		const dy = target.y - this.y
		const dist = Math.sqrt(dx * dx + dy * dy)

		if (dist > target.width + 5) {
			const angleToTarget = Math.atan2(dy, dx)
			const drift = (Math.random() - 0.5) * 0.5
			const moveAngle = angleToTarget + drift
			this.x += Math.cos(moveAngle) * this.speed
			this.y += Math.sin(moveAngle) * this.speed
			this.sprite.rotation = moveAngle + Math.PI / 2
			const angle = Math.atan2(dy, dx)
			this.sprite.rotation = angle + Math.PI / 2
			if (this.timers['eating']) this.stopEating()
			this.changeState('walk')
		} else if (!this.timers['eating'] && target.health > 0) {
			this.runEating(target)
		}
	}

	wander() {
		const prevX = this.x
		const prevY = this.y

		this.wanderAngle += (Math.random() - 0.5) * 0.3
		this.x += Math.cos(this.wanderAngle) * this.speed
		this.y += Math.sin(this.wanderAngle) * this.speed
		this.sprite.rotation = this.wanderAngle + Math.PI / 2

		const moved = Math.hypot(this.x - prevX, this.y - prevY)
		if (moved < 0.5) {
			this._stuckTime++
			if (this._stuckTime > 60) {
				this.wanderAngle = Math.random() * Math.PI * 2
				this._stuckTime = 0
			}
		} else {
			this._stuckTime = 0
		}
		this.changeState('walk')
	}

	checkForMouse(mousePosition: { x: number; y: number }) {
		const dx = mousePosition.x - this.x
		const dy = mousePosition.y - this.y
		const dist = Math.sqrt(dx * dx + dy * dy)

		if (dist < 80 && Math.random() < this.awareness) {
			this.startRunAway()
		}
	}

	runAway() {
		if (this.runAwayAngle === undefined) return
		this.x += Math.cos(this.runAwayAngle) * this.speed * 2
		this.y += Math.sin(this.runAwayAngle) * this.speed * 2
		this.healthBar.updatePosition(this.x, this.y)
	}

	startRunAway() {
		if (this.isScared) return
		this.isScared = true
		this.changeState('walk')
		const threat = this.game.scene.app.renderer.events.pointer
		const angle = Math.atan2(this.y - threat.y, this.x - threat.x)
		this.runAwayAngle = angle
		this.sprite.rotation = this.runAwayAngle + Math.PI / 2
		this.sprite.animationSpeed = this.animationSpeed * 2
		this.timers['runAway'] = setTimeout(() => {
			if (this.sprite) {
				this.isScared = false
				this.sprite.animationSpeed = this.animationSpeed
			}
		}, 1000)
	}

	hit(damage: number) {
		this.health -= damage
		if (this.health <= 0) {
			this.die()
		} else {
			this.startRunAway()
			this.healthBar?.update(this.health)
		}
	}

	findBestFood(foods: Food[]) {
		let bestFood = null
		let bestScore = -Infinity

		for (const food of foods) {
			if (food.health <= 0) continue

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

	runEating(food: Food) {
		this.eat(food)
		this.changeState('idle')
		this.timers['eating'] = setInterval(() => {
			this.eat(food)
		}, this.eatSpeed)
	}

	eat(food: Food) {
		food.damage(this.appetite)
		if (food.health <= 0) this.stopEating()
	}

	die() {
		if (this.state === 'dead') return
		this.changeState('dead')
		this.stopEating()
		this.remove()
		this.game.controls.play(this.dieSound)
		this.game.bugDie(this)
	}

	changeState(state: string) {
		if (this.state === 'dead' || this.state === state) return

		if (this.state !== 'idle' && state === 'idle') {
			this.sprite.textures = this.spritesheets.animations.idle
			this.sprite.play()
		} else if (this.state !== 'walk' && state === 'walk') {
			this.sprite.textures = this.spritesheets.animations.walk
			this.sprite.play()
		}

		this.state = state
	}

	stopEating() {
		if (this.timers['eating']) {
			clearInterval(this.timers['eating'])
			delete this.timers['eating']
		}
	}

	remove() {
		this.game.area.removeChild(this)
		this.game.area.removeChild(this.healthBar)
		this.game.scene.removeUpdate(this.name)
		this.healthBar.destroy()
		this.sprite.destroy()
		for (const timer in this.timers) {
			clearTimeout(this.timers[timer])
		}
	}
}
