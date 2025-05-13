import { Texture } from 'pixi.js'

export interface ISpritesheet {
	frames: {
		[key: string]: {
			frame: { x: number; y: number; w: number; h: number }
			sourceSize: { w: number; h: number }
			spriteSourceSize: { x: number; y: number; w: number; h: number }
		}
	}
	meta: {
		image: string
		scale: string
		size: { w: number; h: number }
	}
	animations: {
		[key: string]: string[]
	}
}

export interface I_LevelOpt {
	area: string
	bugsCount: number
	swatter: string
	bugs: { [key: number]: string }
}

export interface IArea {
	animationSpritesheet?: ISpritesheet
	animationSpeed?: number
	animationWidth?: number
	animationHeight?: number
	animationMoveSpeed?: number
	texture: string
	width: number
	height: number
}

export interface I_AreaOpt {
	animationSpritesheet: ISpritesheet
	animationSpeed: number
	animationWidth: number
	animationHeight: number
	animationMoveSpeed: number
	texture: Texture
	areaName: string
	width: number
	height: number
}

export interface IAreas {
	[key: string]: IArea
}

export interface IFood {
	texture: string
	data: ISpritesheet
	health: number
	attractiveness: number
}

export interface IFoods {
	[key: string]: IFood
}

export interface IBug {
	width: number
	height: number
  health: number
  dieSound: string
  data: ISpritesheet
  animationSpeed: number
  appetite: number
  eatSpeed: number
	score: number
  speed: number
  intelligence: number
}

export interface IBugs {
  [key: string]: IBug
}

export interface ISwatter {
	texture: string
	data: ISpritesheet
	anchor: { x: number; y: number }
	damage: number
	cooldown: number
}

export interface ISwatters {
	[key: string]: ISwatter
}

export interface ILevel {
	area: string
	bugsCount: number
	swatter: string
	bugs: { [key: number]: string }
}

export interface ILevels {
	[key: number]: ILevel
}
