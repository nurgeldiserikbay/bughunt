<script lang="ts" setup>
import { onMounted } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Fullscreen } from '@boengli/capacitor-fullscreen'

import Admob from '@/utils/admob'

import { useAdsStore } from '@/store/adsStore'
import { usePageStore } from '@/store/pageStore'
import { useGameStore } from '@/store/gameStore'

const adsStore = useAdsStore()
const pageStore = usePageStore()
const gameStore = useGameStore()

onMounted(async () => {
	// Подписку ставим до initialize(): первое событие баннера может прийти
	// раньше, чем страница успеет смонтироваться, и потеряться.
	Admob.onBannerChange((live, height) => adsStore.setBanner(live, height))

	if (Capacitor.getPlatform() === 'android') {
		void Admob.initialize().catch(() => {})
	}

	if (Capacitor.getPlatform() === 'android') {
		await Fullscreen.activateImmersiveMode()
		await StatusBar.hide()
		await StatusBar.setOverlaysWebView({ overlay: true })
		await SplashScreen.hide()

		App.addListener('backButton', () => {
			App.exitApp()
		})
	}

	await gameStore.loadData()
})
</script>

<template>
	<div class="wrapper">
		<component :is="pageStore.currentPageComponent" />
	</div>
</template>

<style lang="scss" scoped>
.wrapper {
	position: relative;
	width: 100%;
	max-width: 580px;
	margin: 0 auto;
	min-height: 100dvh;
	height: 100dvh;
	background: url('assets/img/bg.png') repeat;
	background-size: 100% 100%;
	background-position: center;
}
</style>
