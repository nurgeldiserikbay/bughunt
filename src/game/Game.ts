import { Assets, Spritesheet, Texture, TextStyle, Text, Ticker } from 'pixi.js'

import { getCloseValue } from './helpers'

import { IAssetsSrc, IGameCallbacks, IGameOpt } from './interfaces'

import Scene from './Scene'

import { AREAS, BUGS, FLY_SWATTER, FOODS, ILevel, LEVEL } from './consts'

import { Area } from './entities/Area'
import { Food } from './entities/Food'
import { Bug } from './entities/Bug'
import { FlySwatter } from './entities/Swatter'

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
	area: Area
	foods: Food[]
	bugs: Bug[]
	timeOvered: boolean
	swatter?: FlySwatter
	stats: {
		allDiedBugs: number
		diedBugs: number
		score: number
	}

	constructor({ scene, opt }: IGameOpt) {
		this.scene = scene
		this.loadedAssets = {}
		this.spritesheets = {}
		this.timerIds = {}
		this.controls = opt
		this.textStyle = new TextStyle({
			fontFamily: 'Arial',
			fontSize: 32,
			fill: 0xffffff,
			stroke: 0x000000,
		})

		this.area = new Area(this.scene)
		this.foods = []
		this.bugs = []
		this.timeOvered = false

		this.stats = {
			allDiedBugs: 0,
			diedBugs: 0,
			score: 0,
		}
	}

	async init() {
		this.area.init()
		this.scene.addElem(this.area.grid)
		// this.area.grid.scale.set(
		// 	Math.min(
		// 		this.scene.canvas.clientWidth / this.scene.canvas.width,
		// 		this.scene.canvas.clientHeight / this.scene.canvas.height
		// 	)
		// )
		this.scene.addUpdate('area', () => {
			this.area.updateUI()
		})
	}

	async start(round: number) {
		this.reset()
		this.levelOption = this.getLevelOption(round)
		const assets = this.getLevelAssets(this.levelOption)
		await this.preload(assets)
		await this.loadSpritesheet(this.levelOption)

		this.timeOvered = false
		this.setArea()
		this.setSwatter()
		this.createFood(round)
		this.createBugs(round)
	}

	reset() {
		this.stats.diedBugs = 0
		this.controls.drawScore('diedBugs', this.stats.diedBugs)
		this.foods.forEach((food) => food.die())
		this.timeOvered = false
		this.bugs.forEach((bug) => bug.remove())
	}

	createScorePopup(x: number, y: number, points: number) {
		const scoreText = new Text({
			text: `+${points}`,
			style: this.textStyle,
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
			scoreText.y -= riseSpeed
			scoreText.alpha -= alphaDecay

			if (scoreText.alpha <= 0) {
				ticker.stop()
				this.area.grid.removeChild(scoreText)
			}
		})

		ticker.start()
	}

	createFood(round: number) {
		if (!this.levelOption) return

		const count = Math.min(Math.floor(Math.random() * round) + 1, 3)

		for (let i = 0; i < count; i += 1) {
			const foodType = this.levelOption.food

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

		if (summ === 0) this.foodEated()
	}

	foodEated() {
		if (this.timerIds['bugs']) clearInterval(this.timerIds['bugs'])
		this.controls.endGame()
	}

	createBugs(round: number) {
		this.timerIds['bugs'] = setInterval(() => {
			if (!this.levelOption) return
			const alives = this.bugs.filter((b) => b.state !== 'dead').length
			if (this.levelOption?.bugsCount > alives) this.createBug(round)
		}, 2000)
	}

	createBug(round: number) {
		if (!this.levelOption) return

		const count = Math.min(Math.floor(Math.random() * round) + 1, 3)
		const bugProb = Object.keys(this.levelOption.bugs).map((k) => Number(k))

		const alives = this.bugs.filter((b) => b.state !== 'dead').length
		for (
			let i = 0;
			i < Math.min(count, this.levelOption?.bugsCount - alives);
			i += 1
		) {
			const bugType =
				this.levelOption.bugs[getCloseValue(bugProb, Math.random() * 100)]

			new Bug(bugType, this)
		}

		this.bugCalculate()
	}

	bugCalculate() {
		const alives = this.bugs.filter((b) => b.state !== 'dead').length
		this.controls.drawScore('bugs', alives)

		if (alives === 0 && this.timeOvered) {
			const summFood = this.foods.reduce((t, f) => {
				t += Math.max(f.health, 0)
				return t
			}, 0)
			this.stats.score += summFood

			this.controls.drawScore('score', this.stats.score)

			this.controls.roundEnd()
		}
	}

	bugDie(value: number) {
		this.stats.diedBugs += 1
		this.stats.allDiedBugs += 1
		this.stats.score += value
		this.bugCalculate()
		this.controls.drawScore('diedBugs', this.stats.diedBugs)
		this.controls.drawScore('allDiedBugs', this.stats.allDiedBugs)
		this.controls.drawScore('score', this.stats.score)
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
		const dim = Math.max(this.scene.canvas.width, this.scene.canvas.height)
		this.area.setArea({
			...area,
			width: dim * 1.2,
			height: dim * 1.2,
			texture: this.loadedAssets[this.levelOption.area],
			textureMask: this.loadedAssets[`${this.levelOption.area}-mask`],
		})
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
			{
				alias: `${level.area}-mask`,
				loader: 'loadTextures',
				src: AREAS[level.area].textureMask,
			},
			{
				alias: level.swatter,
				loader: 'loadTextures',
				src: FLY_SWATTER[level.swatter].texture,
			},
			{
				alias: level.food,
				loader: 'loadTextures',
				src: FOODS[level.food].texture,
			},
		]

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

		const spritesheet = new Spritesheet(
			this.loadedAssets[level.swatter],
			FLY_SWATTER[level.swatter].data
		)
		await spritesheet.parse()
		spritesheets[level.swatter] = spritesheet

		const foodSpritesheet = new Spritesheet(
			this.loadedAssets[level.food],
			FOODS[level.food].data
		)
		await foodSpritesheet.parse()
		spritesheets[level.food] = foodSpritesheet

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
