import { Container } from 'pixi.js'

import Scene from './Scene'

export interface IPixiContainer extends Container {}

export interface IPoint {
	x: number
	y: number
}

// Game and Builder
export interface IGameCallbacks {
	drawScore: (key: string, value: number) => void,
	roundEnd: () => void,
	endGame: () => void,
	play: (name: string) => void,
}

export interface IGameOpt {
	scene: Scene
	opt: IGameCallbacks
}

// GameController
export interface IGameController {
	canvas: HTMLCanvasElement
	opt: IGameCallbacks
}

// Scene
export interface ISceneOpt {
	canvas: HTMLCanvasElement
}

//Commons
export interface ITicker {
	deltaMS: number
	lastTime: number
}

export interface IAssetsSrc {
	alias: string
	loader: string
	src: string
}
