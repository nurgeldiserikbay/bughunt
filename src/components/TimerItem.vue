<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'

const $props = withDefaults(
	defineProps<{
		level: number
		isWin: boolean
		scale?: number
	}>(),
	{
		scale: 1,
	}
)

const $emits = defineEmits(['timeend', 'addtimescore'])

let timerId: ReturnType<typeof setInterval> | undefined

const date = ref(0)
const getTimeValue = computed(() => {
	const baseTime = 15 * 20
	const levelBonus = Math.floor($props.level / 3) * 5 * 20
	const totalTime = (baseTime + levelBonus) / $props.scale

	return totalTime
})
const getWidth = computed(() => {
	return `${(date.value / getTimeValue.value) * 100}%`
})

watch(
	() => $props.isWin,
	() => {
		if ($props.isWin) {
			$emits('addtimescore', date.value)
			clearTimer()
		}
	}
)

watch(
	() => $props.level,
	() => {
		createTimer()
	}
)

onMounted(() => {
	createTimer()
})

onBeforeUnmount(() => {
	clearTimer()
})

function createTimer() {
	clearTimer()
	date.value = getTimeValue.value
	timerId = setInterval(() => {
		date.value -= 1
		if (date.value === 0) {
			clearTimer()
			$emits('timeend')
		}
	}, 100)
}

function clearTimer() {
	if (timerId) clearInterval(timerId)
}
</script>

<template>
	<div class="time">
		<div
			class="time__in"
			:style="{
				width: getWidth,
			}"
		></div>
	</div>
</template>

<style lang="scss" scoped>
.time {
	max-width: 80%;
	flex-grow: 1;
	font-size: 14px;
	box-sizing: border-box;
	height: 24px;
	text-align: center;
	border-radius: 20px;
	overflow: hidden;
	background: rgba(0, 0, 0, 0.3);

	&__in {
		position: relative;
		height: 100%;
		background: rgba(255, 255, 0, 0.7);
	}
}
</style>
