import * as PIXI from 'pixi.js'

import { ISceneOpt, ITicker } from './interfaces'

export default class Scene {
	private _app: PIXI.Application
	private _updates: Map<string, (ticker: ITicker) => void>

	canvas: HTMLCanvasElement
	app: PIXI.Application

	constructor({ canvas }: ISceneOpt) {
		this.canvas = canvas
		this._app = new PIXI.Application()
		this._updates = new Map()

		this.app = this._app
	}

	async init() {
		this.canvas.width = this.canvas.clientWidth
		this.canvas.height = this.canvas.clientHeight

		await this._app.init({
			backgroundAlpha: 0,
			canvas: this.canvas,
			width: this.canvas.width,
			height: this.canvas.height,
			// resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			antialias: true,
		})
	}

	addElem(graphics: any) {
		if (graphics) {
			this._app.stage.addChild(graphics)
		}
	}

	removeElem(graphics: any) {
		if (graphics) {
			this._app.stage.removeChild(graphics)
		}
	}

	addUpdate(name: string, func: (ticker: ITicker) => void) {
		this._updates.set(name, func)
	}

	removeUpdate(name: string) {
		this._updates.delete(name)
	}

	render() {
		this._app.ticker.add((ticker: ITicker) => {
			for (let update of this._updates.values()) {
				update({
					deltaMS: ticker.deltaMS,
					lastTime: ticker.lastTime,
				})
			}
		})
	}

	start() {
		this.render()
	}

	destroy() {
		this._app.destroy()
	}
}
