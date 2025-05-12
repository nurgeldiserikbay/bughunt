<script lang="ts" setup>
import IconBack from '@/assets/img/back.svg'

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
		<IconBack />
	</button>
</template>

<style lang="scss" scoped>
.back-link {
	background: rgba(0, 0, 0, 0.4);
	border-radius: 50%;
	padding: 0;
	border: none;
	outline: none;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	border: 2.5px solid #fff;

	svg {
		width: 30px;
		height: 30px;
		display: block;
	}
}
</style>
