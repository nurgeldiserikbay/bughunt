<script lang="ts" setup>
import { usePageStore } from '@/store/pageStore'
import { useAudio } from '@/composables/useAudio'

const pageStore = usePageStore()
const audioCont = useAudio()

function back() {
	audioCont.playAudio('click')
	pageStore.toBackLink()
}
</script>

<template>
	<button class="back-link" @click="back">
		<img src="@/assets/img/back.png" alt="exit" />
	</button>
</template>

<style lang="scss" scoped>
.back-link {
	background: transparent;
	padding: 0;
	border: none;
	outline: none;
	cursor: pointer;

	img {
		width: 40px;
		height: 40px;
	}
}
</style>
