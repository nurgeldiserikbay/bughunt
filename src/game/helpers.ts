import { Graphics, Container } from 'pixi.js'
import gsap from 'gsap'

export function getCloseValue(list: number[], value: number) {
	const d = list.map((v) => Math.abs(v - value))
	const min = Math.min(...d)
	const minInd = d.findIndex((i) => i === min)
	return list[minInd]
}

export function drawWave(wrapper: Container, x: number, y: number, width: number = 50) {
	const wave = new Graphics()
	wave.circle(0, 0, 1)
	wave.fill('#ffffff44')
	wave.x = x
	wave.y = y
	wrapper.addChild(wave)

	gsap.to(wave.scale, {
		x: width,
		y: width,
		duration: 0.5,
		ease: 'power2.out',
	})
	gsap.to(wave, {
		alpha: 0,
		duration: 0.5,
		onComplete: () => { wrapper.removeChild(wave) },
	})
}
