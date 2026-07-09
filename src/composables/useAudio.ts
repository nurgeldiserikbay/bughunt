import { ref } from 'vue'

export const audioList: { [key: string]: string } = {
	click: '/sounds/click.mp3',
	dieAnt: '/sounds/die-ant.mp3',
	dieBeetle: '/sounds/die-beetle.mp3',
	dieCockroach: '/sounds/die-cockroach.mp3',
	dieLadybird: '/sounds/die-ladybird.mp3',
	swat1: '/sounds/swat1.mp3',
	swat2: '/sounds/swat2.mp3',
	swat3: '/sounds/swat3.mp3',
	'bug-boogie': '/sounds/bug-boogie.mp3',
	win: '/sounds/win.mp3',
}

const audioActive = ref(true)
const musicActive = ref(true)

let music: { [key: string]: HTMLAudioElement } = {}

export const useAudio = () => {
	function playAudio(audioType: string, anyway: boolean = false) {
		if (!anyway && (!audioActive.value || !audioList[audioType])) return

		if (audioList[audioType]) {
			const audio = new Audio(audioList[audioType])
			audio.play()
		}
	}

	function toggleAudio() {
		audioActive.value = !audioActive.value
	}

	function toggleMusic() {
		musicActive.value = !musicActive.value

		if (musicActive.value) {
			Object.entries(music).forEach(([_, audio]) => {
				audio.volume = 0.5
			})
		} else {
			Object.entries(music).forEach(([_, audio]) => {
				audio.volume = 0
			})
		}

		playAudio('click')
	}

	function play(name: string) {
		if (!audioList[name]) return

		if (musicActive.value) {
			if (music[name]) {
				music[name].play()
				music[name].currentTime = 0
			} else {
				music[name] = new Audio(audioList[name])

				music[name].addEventListener(
					'canplaythrough',
					function () {
						this.play().catch((_: any) => {
							document.addEventListener(
								'click',
								() => {
									this.play()
								},
								{
									once: true,
								}
							)
						})
					},
					false
				)

				music[name].addEventListener(
					'ended',
					function () {
						this.currentTime = 0
						this.play()
					},
					false
				)
				music[name].volume = 0.5
			}
		}
	}

	function stop(name: string) {
		if (music[name]) music[name].pause()
	}

	return {
		audioActive,
		musicActive,
		toggleAudio,
		playAudio,
		toggleMusic,
		play,
		stop,
	}
}
