import { Assets, Spritesheet, Texture, TextStyle, Text, Ticker } from 'pixi.js'

import { getCloseValue } from './helpers'

import { IAssetsSrc, IGameCallbacks, IGameOpt } from './interfaces'

import Scene from './Scene'

import { AREAS, BUGS, FLY_SWATTER, FOODS, LEVEL } from './consts'

import { Area } from './entities/Area'
import { Food } from './entities/Food'
import { Bug } from './entities/Bug'
import { FlySwatter } from './entities/Swatter'

import { ILevel } from './types'

const FOODS_KEYS = Object.keys(FOODS)

export default class Game {
	scene: Scene
	loadedAssets: { [key: string]: Texture }
	spritesheets: { [key: string]: Spritesheet }
	timerIds: {
		[key: string]: ReturnType<typeof setInterval> | null
	}
	levelOption?: ILevel
	controls: IGameCallbacks
	textStyle: TextStyle
	textStyleRed: TextStyle
	area: Area
	foods: Food[]
	bugs: Bug[]
	timeOvered: boolean
	swatter?: FlySwatter
	stats: {
		score: number
		combo: number
		lastKillTime: number
		maxCombo: number
	}
	isPaused: boolean

	constructor({ scene, opt }: IGameOpt) {
		this.scene = scene
		this.loadedAssets = {}
		this.spritesheets = {}
		this.timerIds = {}
		this.controls = opt
		this.textStyle = new TextStyle({
			fontFamily: 'Arial',
			fontSize: 28,
			fill: 0xffffff,
			stroke: 0x000000,
		})
		this.textStyleRed = new TextStyle({
			fontFamily: 'Arial',
			fontSize: 28,
			fill: 0xff0000,
			stroke: 0x000000,
		})

		this.area = new Area(this.scene)
		this.foods = []
		this.bugs = []
		this.timeOvered = false
		this.isPaused = false

		this.stats = {
			score: 0,
			combo: 0,
			lastKillTime: 0,
			maxCombo: 0,
		}
	}

	async init() {
		this.scene.addElem(this.area.grid)
	}

	pause() {
		if (this.isPaused) return
		this.isPaused = true

		// Pause all foods
		this.foods.forEach(food => {
			if (food.animationTicker) {
				food.animationTicker.stop()
			}
		})

		// Stop bug spawning
		if (this.timerIds['bugs']) {
			clearInterval(this.timerIds['bugs'])
		}
	}

	resume() {
		if (!this.isPaused) return
		this.isPaused = false

		// Resume all foods
		this.foods.forEach(food => {
			if (food.animationTicker) {
				food.animationTicker.start()
			}
		})

		// Resume bug spawning
		if (!this.timeOvered) {
			this.createBugs()
		}
	}

	async start(round: number) {
		this.reset()
		this.levelOption = this.getLevelOption(round)
		const assets = this.getLevelAssets(this.levelOption)
		await this.preload(assets)
		await this.loadSpritesheet(this.levelOption)
		this.bugs = []
		this.foods = []
		this.timeOvered = false
		this.isPaused = false
		this.setArea()
		this.setSwatter()
		this.createFood(round)
		this.createBugs()
	}

	reset() {
		this.foods.forEach((food) => food.die())
		this.timeOvered = false
		this.bugs.forEach((bug) => bug.remove())
		this.isPaused = false
	}

	createScorePopup(
		x: number,
		y: number,
		points: number,
		textStyle?: TextStyle
	) {
		const scoreText = new Text({
			text: `+${points}`,
			style: textStyle || this.textStyle,
		})
		scoreText.zIndex = 1000

		scoreText.anchor.set(0.5)
		scoreText.x = x
		scoreText.y = y

		this.area.grid.addChild(scoreText)

		let alphaDecay = 0.01
		let riseSpeed = 1

		const ticker = new Ticker()
		ticker.add(() => {
			if (!this.isPaused) {
				scoreText.y -= riseSpeed
				scoreText.alpha -= alphaDecay

				if (scoreText.alpha <= 0) {
					ticker.stop()
					this.area.grid.removeChild(scoreText)
				}
			}
		})

		ticker.start()
	}

	createFood(round: number) {
		if (!this.levelOption) return

		const count = Math.min(Math.floor(Math.random() * round) + 1, 3)

		for (let i = 0; i < count; i += 1) {
			const foodType =
				FOODS_KEYS[Math.floor(Math.random() * Object.keys(FOODS_KEYS).length)]

			new Food(foodType, this)
		}

		this.foodCalculate()
	}

	foodCalculate() {
		const summ = this.foods.reduce((t, f) => {
			t += Math.max(f.health, 0)
			return t
		}, 0)
		this.controls.drawScore('foodHealth', summ)

		if (summ <= 0) this.foodEated()
	}

	foodEated() {
		if (this.timerIds['bugs']) clearInterval(this.timerIds['bugs'])
		this.controls.endGame()
	}

	createBugs() {
		this.timerIds['bugs'] = setInterval(() => {
			if (!this.levelOption || this.isPaused) return
			if (this.levelOption?.bugsCount > this.bugs.length) this.createBug()
		}, 2000)
	}

	createBug() {
		if (!this.levelOption) return

		const count = Math.min(
			Math.floor(Math.random() * this.levelOption.bugsCount) + 1,
			50
		)
		const bugProb = Object.keys(this.levelOption.bugs).map((k) => Number(k))

		for (
			let i = 0;
			i < Math.min(count, this.levelOption?.bugsCount - this.bugs.length);
			i += 1
		) {
			const bugType =
				this.levelOption.bugs[getCloseValue(bugProb, Math.random() * 100)]

			new Bug(bugType, this)
		}

		this.bugCalculate()
	}

	filterBugs() {
		if (this.timerIds['bugsDied']) clearInterval(this.timerIds['bugsDied'])
		this.timerIds['bugsDied'] = setTimeout(() => {
			const died = this.bugs.filter((b) => b.state === 'dead')
			let extraScore = 0
			if (died.length > 1) {
				extraScore = died.reduce((t, b) => t + b.score, 0)
				this.createScorePopup(
					died[0].x,
					died[0].y,
					extraScore,
					this.textStyleRed
				)
			}
			this.stats.score += extraScore
			this.controls.drawScore('score', this.stats.score)
			this.bugs = this.bugs.filter((b) => b.state !== 'dead')
		}, 100)
	}

	bugCalculate() {
		const alives = this.bugs.filter((b) => b.state !== 'dead')
		this.controls.drawScore('bugs', alives.length)

		if (alives.length === 0 && this.timeOvered) {
			const summFood = this.foods.reduce((t, f) => {
				t += Math.max(f.health * 0.1, 0)
				return t
			}, 0)
			this.stats.score += Math.round(summFood)

			this.controls.drawScore('score', this.stats.score)

			this.controls.roundEnd()
		}
	}

	bugDie(bug: Bug) {
		this.filterBugs()

		this.stats.score += bug.score
		this.controls.drawScore('score', this.stats.score)
		this.createScorePopup(bug.x, bug.y, bug.score)

		this.bugCalculate()
	}

	timeOver() {
		this.timeOvered = true
		if (this.timerIds['bugs']) clearInterval(this.timerIds['bugs'])
		this.bugCalculate()
	}

	setArea() {
		if (!this.levelOption?.area) return
		const area = AREAS[this.levelOption.area]
		if (!area) return
		this.area.setArea(
			{
				...area,
				width: this.scene.canvas.clientWidth,
				height: this.scene.canvas.clientHeight,
				texture: this.loadedAssets[this.levelOption.area],
				areaName: this.levelOption.area,
				// textureMask: this.loadedAssets[`${this.levelOption.area}-mask`],
			},
			this
		)
	}

	setSwatter() {
		if (!this.levelOption?.swatter) return
		if (this.swatter) this.swatter.dispose()

		this.swatter = new FlySwatter(this.levelOption?.swatter, this)
	}

	getLevelOption(round: number) {
		const levelKeys = Object.keys(LEVEL)
		const levelKey =
			levelKeys.find((l) => +l > round) || levelKeys[levelKeys.length - 1]
		return LEVEL[+levelKey]
	}

	getLevelAssets(level: ILevel) {
		const assets: IAssetsSrc[] = [
			{
				alias: level.area,
				loader: 'loadTextures',
				src: AREAS[level.area].texture,
			},
			// {
			// 	alias: `${level.area}-mask`,
			// 	loader: 'loadTextures',
			// 	src: AREAS[level.area].textureMask,
			// },
			{
				alias: level.swatter,
				loader: 'loadTextures',
				src: FLY_SWATTER[level.swatter].texture,
			},
			{
				alias: `${level.area}-animation`,
				loader: 'loadTextures',
				src: AREAS[level.area].animationSpritesheet?.meta.image || '',
			},
		]

		Object.values(FOODS_KEYS).forEach((food) => {
			assets.push({
				alias: food,
				loader: 'loadTextures',
				src: FOODS[food].data.meta.image,
			})
		})

		Object.values(level.bugs).forEach((bug) => {
			assets.push({
				alias: bug,
				loader: 'loadTextures',
				src: BUGS[bug].data.meta.image,
			})
		})

		return assets.filter((a) => !this.loadedAssets[a.alias])
	}

	async preload(assets: IAssetsSrc[]) {
		const result = await Assets.load(assets)
		this.loadedAssets = {
			...this.loadedAssets,
			...result,
		}
	}

	async loadSpritesheet(level: ILevel) {
		const spritesheets: { [key: string]: Spritesheet } = {}

		if (
			!this.spritesheets[`${level.area}-animation`] &&
			AREAS[level.area].animationSpritesheet
		) {
			const spritesheet = new Spritesheet(
				this.loadedAssets[`${level.area}-animation`],
				AREAS[level.area].animationSpritesheet || {}
			)
			await spritesheet.parse()
			spritesheets[`${level.area}-animation`] = spritesheet
		}

		if (!this.spritesheets[level.swatter]) {
			const spritesheet = new Spritesheet(
				this.loadedAssets[level.swatter],
				FLY_SWATTER[level.swatter].data
			)
			await spritesheet.parse()
			spritesheets[level.swatter] = spritesheet
		}

		await Promise.all(
			Object.values(FOODS_KEYS)
				.filter((food) => !this.spritesheets[food])
				.map(async (food) => {
					const spritesheet = new Spritesheet(
						this.loadedAssets[food],
						FOODS[food].data
					)
					await spritesheet.parse()

					spritesheets[food] = spritesheet
				})
		)

		await Promise.all(
			Object.values(level.bugs)
				.filter((bug) => !this.spritesheets[bug])
				.map(async (bug) => {
					const spritesheet = new Spritesheet(
						this.loadedAssets[bug],
						BUGS[bug].data
					)
					await spritesheet.parse()

					spritesheets[bug] = spritesheet
				})
		)

		this.spritesheets = {
			...this.spritesheets,
			...spritesheets,
		}
	}
}
