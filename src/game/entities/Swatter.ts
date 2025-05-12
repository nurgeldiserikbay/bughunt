import { FederatedPointerEvent, AnimatedSprite, Spritesheet } from 'pixi.js'

import { FLY_SWATTER } from '../consts'

import Game from '../Game'
import { drawWave } from '../helpers'

const AUDIO_LIST = ['swat1', 'swat2', 'swat3']

const SIZE = 80

export class FlySwatter extends AnimatedSprite {
	game: Game
	damage?: number
	cooldown?: number
	timer?: ReturnType<typeof setTimeout>
	spritesheets: Spritesheet

	constructor(optName: string, game: Game) {
		super(game.spritesheets[optName].animations.bit)
		this.width = SIZE
		this.height = this.width * 1.57
		this.zIndex = 10
		this.game = game
		this.spritesheets = game.spritesheets[optName]
		this.animationSpeed = 0.5
		this.loop = false

		const opt = FLY_SWATTER[optName]
		this.damage = opt.damage
		this.cooldown = opt.cooldown
		this.anchor.set(opt.anchor.x, opt.anchor.y)

		this.visible = false

		game.area.addChild(this)
		this.game.area.grid.on('pointerdown', this.startHit.bind(this))

		this.onComplete = this.completeFunc
	}

	startHit(event: FederatedPointerEvent) {
		if (this.visible) return
		const pos = this.game.area.grid.toLocal(event.global)
		this.visible = true
		this.x = pos.x
		this.y = pos.y
		this.currentFrame = 0
		this.play()
	}

	completeFunc() {
		let power = this.damage || 0

		const hitX = this.x
		const hitY = this.y

		this.game.bugs.forEach((bug) => {
			const dx = bug.x - hitX
			const dy = bug.y - hitY
			const dist = Math.sqrt(dx * dx + dy * dy)

			if (dist < SIZE) {
				bug.hit((power * Math.max(0, SIZE - dist)) / SIZE)
			}
		})
		drawWave(this.game.area.grid, hitX, hitY)
		this.game.controls.play(
			AUDIO_LIST[Math.floor(AUDIO_LIST.length * Math.random())]
		)
		this.stop()
		this.timer = setTimeout(() => {
			this.visible = false
		}, Number(this.cooldown) * 20)
	}

	dispose() {
		this.game.area.removeChild(this)
		this.game.area.grid.off('pointerdown', this.startHit.bind(this))
	}
}
