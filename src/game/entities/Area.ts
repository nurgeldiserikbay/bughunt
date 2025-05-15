import { Container, Sprite, Ticker, Spritesheet, AnimatedSprite } from 'pixi.js'

import Scene from '../Scene'
import { I_AreaOpt, IArea } from '../types'
import Game from '../Game'

export class Area {
	scene: Scene
	grid: Container
	bg: Sprite | undefined
	animationTicker: Ticker | null
	animationElements: Sprite[]
	spritesheets?: Spritesheet
	option?: I_AreaOpt
	waitTime: number
	nextAnimationSpawn: number

	constructor(scene: Scene) {
		this.scene = scene
		this.grid = new Container()
		this.grid.eventMode = 'static'
		this.animationTicker = null
		this.animationElements = []
		this.waitTime = 0
		this.nextAnimationSpawn = 0
	}

	async setArea(option: I_AreaOpt & IArea, game: Game) {
		this.option = option
		this.grid.x = 0
		this.grid.y = 0

		if (this.bg) {
			this.bg.texture = option.texture
		} else {
			this.bg = new Sprite()
			this.bg.texture = option.texture
			this.grid.addChild(this.bg)
		}
		this.bg.width = option.width
		this.bg.height = option.height
		this.spritesheets = game.spritesheets[`${option.areaName}-animation`]

		if (this.animationTicker) {
			this.animationTicker.destroy()
			this.animationTicker = null
		}

		this.animationElements.forEach((element) => {
			element.destroy()
			this.grid.removeChild(element)
		})
		this.animationElements = []

		this.startAnimations()
	}

	createAnimationElement() {
		if (!this.spritesheets || !this.option) return null

		const element = new AnimatedSprite(this.spritesheets.animations.run)
		const sizeScale = 0.8 + Math.random() * 0.4
		element.width = this.option.animationWidth * sizeScale
		element.height = this.option.animationHeight * sizeScale
		element.x = Math.random() * this.option.width
		element.y = -30
		element.tint = 0xffffff
		;(element as any).speed = this.option.animationMoveSpeed || 1
		element.animationSpeed = this.option.animationSpeed || 0.1
		element.play()
		;(element as any).waitTime = 0
		return element
	}

	startAnimations() {
		if (this.animationTicker) {
			this.animationTicker.destroy()
		}

		this.animationTicker = new Ticker()
		this.animationTicker.add(() => {
			if (this.nextAnimationSpawn <= 0) {
				if (this.animationElements.length < 5 && Math.random() < 0.3) {
					const newElement = this.createAnimationElement()
					if (newElement) {
						this.grid.addChild(newElement)
						this.animationElements.push(newElement)
					}
				}
				this.nextAnimationSpawn = 60 + Math.floor(Math.random() * 120)
			} else {
				this.nextAnimationSpawn--
			}

			this.animationElements = this.animationElements.filter((element) => {
				if ((element as any).waitTime > 0) {
					;(element as any).waitTime--
					return true
				}

				element.y += (element as any).speed
				element.x += Math.sin(element.y / 50) * 0.5

				if (element.y > this.grid.height + 30) {
					if (Math.random() < 0.3) {
						this.grid.removeChild(element)
						element.destroy()
						return false
					} else {
						element.y = -30
						element.x = Math.random() * this.grid.width
						;(element as any).waitTime = 30 + Math.floor(Math.random() * 90)
					}
				}
				return true
			})
		})
		this.animationTicker.start()
	}

	clearAnimations() {
		if (this.animationTicker) {
			this.animationTicker.destroy()
			this.animationTicker = null
		}

		this.animationElements.forEach((element) => {
			this.grid.removeChild(element)
			element.destroy()
		})
		this.animationElements = []
	}

	addChild(child: Sprite | Container) {
		this.grid.addChild(child)
	}

	removeChild(child: Sprite | Container) {
		this.grid.removeChild(child)
	}
}
