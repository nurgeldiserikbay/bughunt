import { IGameController } from './interfaces'
import Scene from './Scene'
import Game from './Game'

export default class GameController {
	private _scene: Scene
	_game: Game

	constructor({ canvas, opt }: IGameController) {
		this._scene = new Scene({ canvas })
		this._game = new Game({
			scene: this._scene,
			opt,
		})
	}

	async init() {
		await this._scene.init()
		await this._game.init()
		this._scene.start()
	}

	async start(round: number) {
		this._game.start(round)
	}
}
