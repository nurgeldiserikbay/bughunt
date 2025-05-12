export default {
	frames: {
		yellow1: {
			frame: { x: 0, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		yellow2: {
			frame: { x: 0, y: 200, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		yellow3: {
			frame: { x: 0, y: 400, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		yellow4: {
			frame: { x: 0, y: 600, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
	},
	animations: {
		bit: [
			'yellow1',
			'yellow2',
			'yellow3',
			'yellow4',
			'yellow3',
			'yellow2',
			'yellow1',
		],
	},
	meta: {
		app: 'https://www.codeandweb.com/texturepacker',
		version: '1.1',
		image: '/img/swatter/yellow.png',
		format: 'RGBA8888',
		size: { w: 128, h: 800 },
		scale: '1',
		smartupdate:
			'$TexturePacker:SmartUpdate:07b70ad3b7d66dffb1324d6c0a96f53d:49c8183defc57552931bb4681479c473:febc7396cbf0f3b6f86706794f0aaa21$',
	},
}
