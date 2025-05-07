<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'

import UiButton from '@/components/UiButton.vue'
import BackLink from '@/components/BackLink.vue'
import TimerItem from '@/components/TimerItem.vue'
import ResultTable from '@/components/ResultTable.vue'

import { usePageStore } from '@/store/pageStore'
import { useAdsStore } from '@/store/adsStore'

import Admob from '@/utils/admob'
import { useAudio } from '@/composables/useAudio'
import GameController from '@/game/GameController'

const pageStore = usePageStore()
const adsStore = useAdsStore()
const audioCont = useAudio()

let timers: { [key: number]: ReturnType<typeof setTimeout> } = {}
const score = ref<{ [key: string]: number }>({
	bugs: 0,
	diedBugs: 0,
	allDiedBugs: 0,
	foodHealth: 0,
	score: 0,
})
const level = ref(0)
const roundEnded = ref(false)
const isEnd = ref(false)

let gameController: GameController
const canvas = ref<HTMLCanvasElement>()

onMounted(async () => {
	audioCont.play('bug-boogie')
	init()

	try {
		if (Capacitor.getPlatform() === 'android') {
			await Admob.showBanner()
		}
	} catch (error: any) {
		// console.log(error)
	}
})

onBeforeUnmount(() => {
	audioCont.stop('bug-boogie')
	clearTimers()
	if (Capacitor.getPlatform() === 'android') {
		Admob.removeBanner()
	}
})

async function init() {
	if (canvas.value) {
		gameController = new GameController({
			canvas: canvas.value,
			opt: {
				drawScore(key: string, value: number) {
					score.value = {
						...score.value,
						[key]: value,
					}
				},
				roundEnd() {
					roundEnded.value = true
					audioCont.stop('bug-boogie')
					audioCont.play('win')
				},
				endGame() {
					isEnd.value = true
				},
				play(name: string) {
					audioCont.playAudio(name)
				},
			},
		})
		await gameController.init()
		startLevel()
	}
}

async function startLevel() {
	roundEnded.value = false
	gameController.start(level.value)
	audioCont.play('bug-boogie')
	audioCont.stop('win')
}

async function nextLevel() {
	if (Capacitor.getPlatform() === 'android') {
		if (adsStore.loading) return
		adsStore.toggleLoading(true)
		await new Promise((res) => {
			Admob.interstitial({
				isFirst: false,
				onInterstitialAdClosed: () => {
					res(true)
				},
			})
		})
		adsStore.toggleLoading(false)
	}
	level.value += 1
	startLevel()
}

function timeend() {
	audioCont.playAudio('timeend')

	gameController._game.timeOver()
}

function clearTimers() {
	Object.values(timers).forEach((id) => clearTimeout(id))
}
</script>

<template>
	<div class="page">
		<BackLink class="page__back" />

		<div class="page__head">
			<TimerItem
				class="time"
				:is-win="false"
				:level="level"
				@addtimescore="() => {}"
				@timeend="timeend"
			/>
			<div class="page__info">
				<div class="page__score">
					<div class="page__score-item">
						<img src="@/assets/img/star.png" alt="" />
						<div>{{ score.score }}</div>
					</div>
				</div>
			</div>
		</div>

		<canvas id="canvas" ref="canvas" />

		<UiButton
			v-if="roundEnded"
			class="page__next"
			@click="audioCont.playAudio('click'), nextLevel()"
		>
			Next
		</UiButton>

		<div class="page__bugs">
			<div class="page__bugs-item">
				<img src="@/assets/img/__red_beetle_idle.png" alt="" />
				<div>{{ score.bugs }}</div>
			</div>
			<!-- <div class="page__bugs-item">
				<img src="@/assets/img/__red_beetle_dead.png" alt="" />
				<div>{{ score.diedBugs }}</div>
			</div> -->
		</div>

		<ResultTable
			v-if="isEnd"
			:level="level"
			:result="score"
			@close="audioCont.playAudio('click'), pageStore.toBackLink()"
		/>
	</div>
</template>

<style lang="scss" scoped>
.page {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	padding: 0px;
	position: relative;

	&__back {
		position: absolute;
		top: 25px;
		left: 2%;
	}

	&__head {
		position: absolute;
		pointer-events: none;
		z-index: 300;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 15px;
		width: 100%;
		box-sizing: border-box;
		padding: 0 10px;
		padding-top: 15px;
		padding-left: 60px;
		margin-bottom: 10px;
	}

	&__info {
		flex-shrink: 0;
		padding: 2px 5px 2px 15px;
		box-sizing: border-box;
		flex-shrink: 0;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 15px;
		color: #000;
		font-size: 22px;
		letter-spacing: 2px;
		backdrop-filter: blur(3px);
		border-radius: 5px;
	}

	&__score {
		width: 100%;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		gap: 5px;
		color: red;
		-webkit-text-stroke: 2px black;
		text-stroke: 2px black;

		img {
			width: 30px;
			display: block;
		}
	}

	&__bugs {
		position: absolute;
		bottom: 60px;
		left: 3%;
		right: 3%;
		display: flex;
		justify-content: space-between;
		gap: 5px;
		pointer-events: none;
	}

	&__bugs-item {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		gap: 0 5px;
		font-size: 22px;
		color: red;
		-webkit-text-stroke: 2px black;
		text-stroke: 2px black;

		img {
			width: 25px;
		}

		&:nth-child(2) {
			img {
				width: 35px;
			}
		}
	}

	&__score-item {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		text-align: center;

		&:nth-child(2) {
			img {
				width: 40px;
			}
		}

		&:nth-child(3) {
			img {
				margin-top: 7px;
			}
		}
	}

	&__next {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 100;
		transform: translate(-50%, -50%);
	}
}

#canvas {
	width: 100%;
	height: 100%;
}
</style>
