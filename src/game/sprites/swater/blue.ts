export default {
	frames: {
		blue1: {
			frame: { x: 0, y: 0, w: 127, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 127, h: 200 },
			sourceSize: { w: 127, h: 200 },
		},
		blue2: {
			frame: { x: 127, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		blue3: {
			frame: { x: 255, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		blue4: {
			frame: { x: 383, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
	},
	animations: {
		bit: [
			'blue1',
			'blue2',
			'blue3',
			'blue4',
			'blue3',
			'blue2',
			'blue1',
		],
	},
	meta: {
		app: 'https://www.codeandweb.com/texturepacker',
		version: '1.1',
		image: '/img/swatter/blue.png',
		format: 'RGBA8888',
		size: { w: 511, h: 200 },
		scale: '1',
		smartupdate:
			'$TexturePacker:SmartUpdate:3c8f94b7619d163347256260705e68ea:938c2f2e957cdd7e395e2b89cf4a5863:febc7396cbf0f3b6f86706794f0aaa21$',
	},
}
