import * as PIXI from 'pixi.js'

import { ISceneOpt, ITicker } from './interfaces'

export default class Scene {
	private _canvas: HTMLCanvasElement
	private _app: PIXI.Application
	private _updates: Map<string, (ticker: ITicker) => void>

	app: PIXI.Application

	constructor({ canvas }: ISceneOpt) {
		this._canvas = canvas
		this._app = new PIXI.Application()
		this._updates = new Map()

		this.app = this._app
	}

	async init() {
		const scale = window.devicePixelRatio
		this._canvas.width = Math.floor(this._canvas.clientWidth * scale)
		this._canvas.height = Math.floor(this._canvas.clientHeight * scale)

		await this._app.init({
			backgroundAlpha: 0,
			canvas: this._canvas,
			width: this._canvas.width,
			height: this._canvas.height,
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
}
