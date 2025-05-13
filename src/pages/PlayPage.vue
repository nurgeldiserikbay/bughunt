<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'

import UiButton from '@/components/UiButton.vue'
import BackLink from '@/components/BackLink.vue'
import TimerItem from '@/components/TimerItem.vue'
import ResultTable from '@/components/ResultTable.vue'
import BugCounter from '@/components/BugCounter.vue'

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
	foodHealth: 0,
	score: 0,
})
const level = ref(0)
const levelView = ref(false)
const roundEnded = ref(false)
const isEnd = ref(false)

let gameController: GameController
const canvas = ref<HTMLCanvasElement>()

onMounted(async () => {
	audioCont.play('bug-boogie')
	init()

	document.addEventListener('visibilitychange', handleVisibilityChange)

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
	gameController.destroy()
	document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function handleVisibilityChange() {
	if (document.hidden) {
		audioCont.stop('bug-boogie')
		if (gameController) {
			gameController.pause()
		}
	} else {
		if (!roundEnded.value && !isEnd.value) {
			audioCont.play('bug-boogie')
			if (gameController) {
				gameController.resume() 
			}
		}
	}
}

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
	levelView.value = true
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
				<img src="@/assets/img/star.png" alt="" :key="score.score" />
				<div class="page__value">{{ score.score }}</div>
			</div>
		</div>

		<canvas id="canvas" ref="canvas" />

		<BugCounter :count="score.bugs" />

		<div
			v-show="levelView"
			:level="level"
			class="level"
			@animationend="levelView = false"
		>
			{{ `Round ${level}` }}
		</div>

		<UiButton
			v-if="roundEnded"
			class="page__next"
			@click="audioCont.playAudio('click'), nextLevel()"
		>
			Next
		</UiButton>

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
		top: 12px;
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

		.time {
			width: 100% !important;
		}
	}

	&__info {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		line-height: 1;
		width: 100px;
		flex-shrink: 0;
		padding: 2px 5px 2px 7px;
		box-sizing: border-box;
		flex-shrink: 0;
		gap: 15px;
		color: #000;
		font-size: 22px;
		letter-spacing: 2px;
		backdrop-filter: blur(3px);
		border-radius: 5px;
		background: rgba(0, 0, 0, 0.3);

		img {
			width: 18px;
			height: 18px;
			opacity: 0.8;
			display: block;
			animation: rotate 0.5s ease-in-out;

			@keyframes rotate {
				0% {
					transform: rotateY(0);
				}
				100% {
					transform: rotateY(360deg);
				}
			}
		}
	}

	&__value {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
		line-height: 1;
		vertical-align: middle;
		text-align: center;
		color: #fff;
		-webkit-text-stroke: 2px black;
		text-stroke: 2px black;

		@media screen and (max-width: 480px) {
			transform: translateY(3px);
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

.level {
	position: absolute;
	top: 30%;
	left: 50%;
	z-index: 100;
	transform: translate(-50%, 0);
	font-size: 36px;
	margin-bottom: 15px;
	animation: level 1s ease-in-out;
	color: #fff;
	-webkit-text-stroke: 2px black;
	text-stroke: 2px black;
	letter-spacing: 3px;

	@keyframes level {
		0% {
			transform: translate(-50%, 0);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -30px);
			opacity: 0;
		}
	}
}

#canvas {
	width: 100%;
	height: 100%;
}
</style>
