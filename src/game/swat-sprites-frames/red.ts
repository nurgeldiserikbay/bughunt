export default {
	frames: {
		red1: {
			frame: { x: 0, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		red2: {
			frame: { x: 128, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		red3: {
			frame: { x: 256, y: 0, w: 128, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 128, h: 200 },
			sourceSize: { w: 128, h: 200 },
		},
		red4: {
			frame: { x: 384, y: 0, w: 129, h: 200 },
			rotated: false,
			trimmed: false,
			spriteSourceSize: { x: 0, y: 0, w: 129, h: 200 },
			sourceSize: { w: 129, h: 200 },
		},
	},
	animations: {
		bit: [
			'red1',
			'red2',
			'red3',
			'red4',
			'red3',
			'red2',
			'red1',
		],
	},
	meta: {
		app: 'https://www.codeandweb.com/texturepacker',
		version: '1.1',
		image: '/img/swatter/red.png',
		format: 'RGBA8888',
		size: { w: 513, h: 200 },
		scale: '1',
		smartupdate:
			'$TexturePacker:SmartUpdate:10a2cad63d0d966da2a4e0410040bb76:ba1f17f53969b6595400f13f1258ae8e:febc7396cbf0f3b6f86706794f0aaa21$',
	},
}
