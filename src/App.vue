<script lang="ts" setup>
import { onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Fullscreen } from '@boengli/capacitor-fullscreen'

import Admob from '@/utils/admob'

import { usePageStore } from '@/store/pageStore'

const pageStore = usePageStore()

onMounted(async () => {
	if (Capacitor.getPlatform() === 'android') {
		Admob.initialize()
	}

	if (Capacitor.getPlatform() === 'android') {
		await Fullscreen.activateImmersiveMode()
		await StatusBar.hide()
		await StatusBar.setOverlaysWebView({ overlay: true })
		await SplashScreen.hide()
	}
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
	max-width: 680px;
	margin: 0 auto;
	min-height: 100dvh;
	height: 100dvh;
	background: url('assets/img/bg.png') repeat;
	background-size: 100% 100%;
	background-position: center;
}
</style>
