<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue'

import { usePageStore } from '@/store/pageStore'

import { useAudio } from '@/composables/useAudio'

import { PAGES } from '@/utils/conts'

const {
	play,
	stop,
	toggleMusic,
	toggleAudio,
	playAudio,
	musicActive,
	audioActive,
} = useAudio()

const pageStore = usePageStore()

onMounted(() => {
	play('bug-boogie')
})

onBeforeUnmount(() => {
	stop('bug-boogie')
})
</script>

<template>
	<div class="page start-page">
		<img class="start-page__logo" src="@/assets/img/logotype.png" alt="" />

		<button
			class="start-page__start"
			@click="pageStore.routeTo(PAGES.PLAY), playAudio('click')"
		>
			<img src="@/assets/img/play.png" />
		</button>

		<div class="start-page__btns">
			<button
				:class="{ active: musicActive }"
				class="start-page__music"
				@click="toggleMusic(), playAudio('click')"
			></button>
			<button
				:class="{ active: audioActive }"
				class="start-page__sound"
				@click="toggleAudio(), playAudio('click')"
			></button>
		</div>

		<a
			href="https://docs.google.com/document/d/1Jmi550uXZppjdmS3TmSRZ36L2V0MaWzjP097IwNXDHI/edit?usp=sharing"
			target="_blank"
			class="privacy"
			>Privacy Policy</a
		>
	</div>
</template>

<style lang="scss" scoped>
.start-page {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	padding-top: 45px;
	padding-bottom: 45px;

	&__logo {
		max-width: 60%;
		max-height: 180px;
		min-width: 180px;
	}

	&__start {
		background: transparent;
		padding: 0;
		border: none;
		cursor: pointer;
		max-width: 180px;
		outline: none;

		img {
			display: block;
			width: 100%;
		}
	}

	&__btns {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 18px;

		button {
			width: 40px;
			height: 40px;
			border-radius: 8px;
			border: none;
			outline: none;
			cursor: pointer;
			opacity: 0.5;
			transition: 0.3s linear;
			background-size: cover;
			background-color: transparent;

			&.active {
				opacity: 1;
			}
		}
	}

	&__music {
		background-image: url('@/assets/img/music.png');
	}

	&__sound {
		background-image: url('@/assets/img/sound.png');
	}
}

.privacy {
	width: fit-content;
	display: inline-block;
	font-size: 16px;
	color: #060606;
	text-decoration: none;
	letter-spacing: 4px;
	text-align: center;
	backdrop-filter: blur(3px);
	padding: 2px 15px;
}
</style>
