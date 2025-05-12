import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'

export interface IGameStat {
	level: number
	score: number
	date: string
}

const STORE_KEY = 'bug-hunt-gameStats'

export const useGameStore = defineStore('GameStore', () => {
	const gameStats = ref<IGameStat[]>([])

	const bestResult = computed(() => {
		return gameStats.value[0]
	})

	watch(
		() => gameStats.value,
		async () => {
			await Preferences.set({
				key: STORE_KEY,
				value: JSON.stringify(gameStats.value),
			})
		},
		{ deep: true }
	)

	function setGameState(level: number, score: number) {
		gameStats.value = [
			...gameStats.value,
			{
				level,
				score,
				date: new Date().toDateString(),
			},
		]
			.sort((a, b) => b.score - a.score)
			.slice(0, 5)
	}

	async function loadData() {
		const res = await Preferences.get({ key: STORE_KEY })

		if (res.value) {
			gameStats.value = JSON.parse(res.value) as IGameStat[]
		}
	}

	return {
		gameStats,
		bestResult,
		setGameState,
		loadData,
	}
})
