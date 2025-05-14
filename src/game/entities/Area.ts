import {
	Container,
	FederatedPointerEvent,
	Point,
	Sprite,
	Ticker,
	Spritesheet,
	AnimatedSprite,
} from 'pixi.js'

import { IPoint } from '../interfaces'

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

		// Stop previous animations if any
		if (this.animationTicker) {
			this.animationTicker.destroy()
			this.animationTicker = null
		}

		// Remove existing animation elements
		this.animationElements.forEach((element) => {
			element.destroy()
			this.grid.removeChild(element)
		})
		this.animationElements = []

		// Start new animation system
		this.startAnimations()
	}

	createAnimationElement() {
		if (!this.spritesheets || !this.option) return null

		const element = new AnimatedSprite(this.spritesheets.animations.run)
		const sizeScale = 0.8 + Math.random() * 0.4
		element.width = this.option.animationWidth * sizeScale // 80-120% of base size
		element.height = this.option.animationHeight * sizeScale
		element.x = Math.random() * this.option.width
		element.y = -30 // Start above screen
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
			// Check if we should spawn a new animation
			if (this.nextAnimationSpawn <= 0) {
				if (this.animationElements.length < 5 && Math.random() < 0.3) {
					// 10% chance to spawn if less than 5 elements
					const newElement = this.createAnimationElement()
					if (newElement) {
						this.grid.addChild(newElement)
						this.animationElements.push(newElement)
					}
				}
				this.nextAnimationSpawn = 60 + Math.floor(Math.random() * 120) // Wait 1-3 seconds before next spawn check
			} else {
				this.nextAnimationSpawn--
			}

			// Update existing animations
			this.animationElements = this.animationElements.filter((element) => {
				if ((element as any).waitTime > 0) {
					;(element as any).waitTime--
					return true
				}

				element.y += (element as any).speed
				element.x += Math.sin(element.y / 50) * 0.5 // Smooth wind-like movement

				// When element goes below screen
				if (element.y > this.grid.height + 30) {
					if (Math.random() < 0.3) {
						// 30% chance to remove element
						this.grid.removeChild(element)
						element.destroy()
						return false
					} else {
						element.y = -30 // Reset to top
						element.x = Math.random() * this.grid.width
						;(element as any).waitTime = 30 + Math.floor(Math.random() * 90) // Wait 0.5-2 seconds
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
