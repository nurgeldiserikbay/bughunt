export default {
	frames: {
		purple1: {
			frame: { x: 0, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		purple2: {
			frame: { x: 128, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		purple3: {
			frame: { x: 256, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		purple4: {
			frame: { x: 384, y: 0, w: 129, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 129, h: 200 },
			sourceSize: { w: 129, h: 200 },
		},
	},
	animations: {
		bit: [
			'purple1',
			'purple2',
			'purple3',
			'purple4',
			'purple3',
			'purple2',
			'purple1',
		],
	},
	meta: {
		app: 'https://www.codeandweb.com/texturepacker',
		version: '1.1',
		image: '/img/swatter/purple.png',
		format: 'RGBA8888',
		size: { w: 513, h: 200 },
		scale: '1',
		smartupdate:
			'$TexturePacker:SmartUpdate:30d3c75ee21771307ecbf1fa450832b9:afc2f27131fa121fda0bed08f0ae4d68:febc7396cbf0f3b6f86706794f0aaa21$',
	},
}
