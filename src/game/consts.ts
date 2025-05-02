import { Texture } from 'pixi.js'

import ant_black from './bugs-sprites-frames/ant_black'
import ant_red from './bugs-sprites-frames/ant_red'
import beetle_black from './bugs-sprites-frames/beetle_black'
import beetle_blue from './bugs-sprites-frames/beetle_blue'
import beetle_green from './bugs-sprites-frames/beetle_green'
import beetle_red from './bugs-sprites-frames/beetle_red'
import beetle_yellow from './bugs-sprites-frames/beetle_yellow'
import cockroach from './bugs-sprites-frames/cockroach'
import ladybird_black from './bugs-sprites-frames/ladybird_black'
import ladybird_red from './bugs-sprites-frames/ladybird_red'
import ladybird_yellow from './bugs-sprites-frames/ladybird_yellow'

// import blue from './swat-sprites-frames/blue'
import purple from './swat-sprites-frames/purple'
// import red from './swat-sprites-frames/red'
// import yellow from './swat-sprites-frames/yellow'

import sugar from './food/sugar'

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

export interface IArea {
	texture: string
	textureMask: string
	width: number
	height: number
}

export interface I_AreaOpt {
	width: number
	height: number
	texture: Texture
	textureMask: Texture
}

export interface IAreas {
	[key: string]: IArea
}

export const AREAS: IAreas = {
	garden: {
		texture: '/img/areas/garden.png',
		textureMask: '/img/areas/garden-mask.png',
		width: 800,
		height: 800,
	},
	// wood1: {
	// 	texture: '/img/areas/wood1.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// wood2: {
	// 	texture: '/img/areas/wood2.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// wood3: {
	// 	texture: '/img/areas/wood3.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// wood4: {
	// 	texture: '/img/areas/wood4.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// grass1: {
	// 	texture: '/img/areas/grass1.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// grass2: {
	// 	texture: '/img/areas/grass2.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// grass3: {
	// 	texture: '/img/areas/grass3.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// grass4: {
	// 	texture: '/img/areas/grass4.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// stone1: {
	// 	texture: '/img/areas/stone1.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// stone2: {
	// 	texture: '/img/areas/stone2.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// stone3: {
	// 	texture: '/img/areas/stone3.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// stone4: {
	// 	texture: '/img/areas/stone4.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// garbage1: {
	// 	texture: '/img/areas/garbage1.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 1000,
	// 	height: 1000,
	// },
	// garbage2: {
	// 	texture: '/img/areas/garbage2.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// garbage3: {
	// 	texture: '/img/areas/garbage3.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
	// garbage4: {
	// 	texture: '/img/areas/garbage4.png',
	// 	textureMask: '/img/areas/garden-mask.png',
	// 	width: 500,
	// 	height: 500,
	// },
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

export const FOODS: IFoods = {
	sugar: {
		texture: '/img/foods/sugar.png',
		data: sugar,
		health: 300,
		attractiveness: 1,
	},
}

export interface IBug {
	health: number
	dieSound: string
	data: ISpritesheet
	animationSpeed: number
	appetite: number
	eatSpeed: number
	speed: number
	intelligence: number
}

export interface IBugs {
	[key: string]: IBug
}

export const BUGS: IBugs = {
	beetle_black: {
		dieSound: 'dieAnt',
		data: beetle_black,
		health: 80,
		appetite: 5,
		eatSpeed: 1000,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.4,
	},
	beetle_blue: {
		dieSound: 'dieBeetle',
		data: beetle_blue,
		health: 80,
		appetite: 5,
		eatSpeed: 1000,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	beetle_green: {
		dieSound: 'dieBeetle',
		data: beetle_green,
		health: 80,
		appetite: 5,
		eatSpeed: 1000,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	beetle_red: {
		dieSound: 'dieBeetle',
		data: beetle_red,
		health: 80,
		appetite: 5,
		eatSpeed: 1000,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	beetle_yellow: {
		dieSound: 'dieBeetle',
		data: beetle_yellow,
		health: 80,
		appetite: 5,
		eatSpeed: 1000,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	ant_black: {
		dieSound: 'dieAnt',
		data: ant_black,
		health: 60,
		appetite: 3,
		eatSpeed: 600,
		speed: 7,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	ant_red: {
		dieSound: 'dieAnt',
		data: ant_red,
		health: 60,
		appetite: 3,
		eatSpeed: 600,
		speed: 7,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	cockroach: {
		dieSound: 'dieCockroach',
		data: cockroach,
		health: 100,
		appetite: 7,
		eatSpeed: 500,
		speed: 10,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	ladybird_black: {
		dieSound: 'dieLadybird',
		data: ladybird_black,
		health: 200,
		appetite: 15,
		eatSpeed: 1400,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	ladybird_red: {
		dieSound: 'dieLadybird',
		data: ladybird_red,
		health: 200,
		appetite: 15,
		eatSpeed: 1400,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
	ladybird_yellow: {
		dieSound: 'dieLadybird',
		data: ladybird_yellow,
		health: 200,
		appetite: 15,
		eatSpeed: 1400,
		speed: 5,
		animationSpeed: 0.3,
		intelligence: 0.3,
	},
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

export const FLY_SWATTER: ISwatters = {
	// blue: {
	// 	texture: '/img/swatter/blue.png',
	// 	anchor: { x: 0.4, y: 0.3 },
	// 	data: blue,
	// 	damage: 140,
	// 	cooldown: 5,
	// },
	purple: {
		texture: '/img/swatter/purple.png',
		anchor: { x: 0.4, y: 0.3 },
		data: purple,
		damage: 140,
		cooldown: 5,
	},
	// red: {
	// 	texture: '/img/swatter/red.png',
	// 	anchor: { x: 0.4, y: 0.3 },
	// 	damage: 140,
	// 	data: red,
	// 	cooldown: 5,
	// },
	// yellow: {
	// 	texture: '/img/swatter/yellow.png',
	// 	anchor: { x: 0.4, y: 0.3 },
	// 	data: yellow,
	// 	damage: 140,
	// 	cooldown: 5,
	// },
}

export interface ILevel {
	area: string
	bugsCount: number
	swatter: string
	food: string
	bugs: { [key: number]: string }
}

export interface ILevels {
	[key: number]: ILevel
}

export const LEVEL: ILevels = {
	2: {
		area: 'garden',
		bugsCount: 3,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			10: 'beetle_yellow',
			25: 'beetle_black',
			50: 'beetle_blue',
			75: 'beetle_yellow',
			100: 'beetle_red',
		},
	},
	3: {
		area: 'garden',
		bugsCount: 4,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			10: 'beetle_yellow',
			25: 'beetle_black',
			50: 'beetle_blue',
			75: 'beetle_yellow',
			85: 'beetle_red',
			100: 'ant_black',
		},
	},
	4: {
		area: 'garden',
		bugsCount: 4,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			19: 'beetle_black',
			28: 'beetle_blue',
			39: 'beetle_yellow',
			50: 'beetle_red',
			75: 'ant_red',
			100: 'ant_black',
		},
	},
	6: {
		area: 'garden',
		bugsCount: 5,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			19: 'beetle_black',
			28: 'beetle_blue',
			39: 'beetle_yellow',
			50: 'beetle_red',
			75: 'ant_red',
			100: 'ant_black',
		},
	},
	7: {
		area: 'garden',
		bugsCount: 5,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			19: 'beetle_black',
			28: 'beetle_blue',
			39: 'beetle_yellow',
			50: 'beetle_red',
			75: 'ant_red',
			85: 'ant_black',
			100: 'cockroach',
		},
	},
	8: {
		area: 'garden',
		bugsCount: 6,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			19: 'beetle_black',
			28: 'beetle_blue',
			39: 'beetle_yellow',
			50: 'beetle_red',
			75: 'ant_red',
			85: 'ant_black',
			95: 'cockroach',
			100: 'ladybird_black',
		},
	},
	9: {
		area: 'garden',
		bugsCount: 6,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
	12: {
		area: 'garden',
		bugsCount: 8,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
	15: {
		area: 'garden',
		bugsCount: 10,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
	18: {
		area: 'garden',
		bugsCount: 12,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
	21: {
		area: 'garden',
		bugsCount: 15,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
	24: {
		area: 'garden',
		bugsCount: 18,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
	28: {
		area: 'garden',
		bugsCount: 50,
		swatter: 'purple',
		food: 'sugar',
		bugs: {
			9: 'beetle_yellow',
			16: 'beetle_black',
			23: 'beetle_blue',
			30: 'beetle_yellow',
			37: 'beetle_red',
			50: 'ant_red',
			60: 'ant_black',
			70: 'cockroach',
			80: 'ladybird_black',
			90: 'ladybird_red',
			100: 'ladybird_red',
		},
	},
}
