<script lang="ts" setup>
import IconHome from '@/assets/img/home.svg'

import { useGameStore } from '@/store/gameStore'

const gameStore = useGameStore()

const $props = withDefaults(
	defineProps<{
		level: number
		result: any
	}>(),
	{}
)

const $emits = defineEmits(['close'])

function clickHome() {
	$emits('close')
	gameStore.setGameState($props.level, $props.result.score)
}
</script>

<template>
	<div class="result">
		<div class="result__in">
			<div class="result__title">{{ `Round ${level}` }}</div>
			<div class="result__table">
				<div class="result__item">
					<div class="result__item-date">
						<img src="@/assets/img/star.png" alt="" />
						{{ result.score > gameStore.bestResult.score ? 'New Record' : '' }}
					</div>
					<div class="result__item-score" style="font-size: 32px">
						{{ result.score }}
					</div>
				</div>

				<div class="result__subtitle">
					{{ 'Best results' }} <img src="@/assets/img/star.png" alt="" />
				</div>
				<div
					v-for="(item, index) in gameStore.gameStats"
					:key="index"
					class="result__item"
				>
					<div class="result__item-date">
						{{ `${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString().slice(0, 5)}` }}
					</div>
					<div class="result__item-score">{{ item.score }}</div>
				</div>
			</div>
			<button class="result__btn" @click="clickHome"><IconHome /></button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import '@/assets/_common.scss';

.result {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	&__in {
		position: relative;
		padding: 30px 5px 40px;
		border-radius: 12px;
		height: 80vh;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: space-around;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
		width: 70%;
		backdrop-filter: blur(3px);
		border-radius: 18px;
		font-size: 28px;
		color: #ffffff;
		-webkit-text-stroke: 2px black;
		text-stroke: 2px black;
	}

	&__table {
		width: 90%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		flex-grow: 1;
		padding-bottom: 30px;
		letter-spacing: 3px;
		font-size: 36px;
		text-align: center;
	}

	&__title {
		font-size: 36px;
		margin-bottom: 15px;
	}

	&__subtitle {
		font-size: 24px;
		display: flex;
		align-items: center;
		gap: 10px;

		img {
			width: 35px;
		}
	}

	&__item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		text-align: center;
		font-size: 24px;

		img {
			width: 35px;
		}
	}

	&__item &__dead {
		width: 50px;
	}

	&__item-date {
		font-size: 16px;
		display: flex;
		align-items: center;
		gap: 20px;
		-webkit-text-stroke: 1px black;
		text-stroke: 1px black;
	}

	&__btn {
		flex-shrink: 0;
		display: block;
		border-radius: 10px;
		padding: 10px;
		border: none;
		cursor: pointer;
		background-size: cover;
		background: rgba(0, 0, 0, 0.3);

		svg {
			width: 36px;
			height: 36px;
		}
	}
}
</style>
