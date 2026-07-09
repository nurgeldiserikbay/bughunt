import {
	AdMob,
	AdmobConsentStatus,
	BannerAdSize,
	BannerAdPosition,
	BannerAdPluginEvents,
	AdMobBannerSize,
	BannerAdOptions,
	InterstitialAdPluginEvents,
	AdLoadInfo,
	AdOptions,
} from '@capacitor-community/admob'

const AdMobInitializationOptions = {
	testingDevices: ['8a1b4b83d67add00', '1f6e845f97c74f32', 'e81b6ee74e7f26dc'],
	// Enable test ads only during local development, never in production builds.
	initializeForTesting: import.meta.env.DEV,
	// NOTE (owner): switched true -> false. This game is not directed at
	// children; keeping COPPA child-directed treatment on would wrongly limit
	// ad serving / eCPM. Set back to true only if the store listing targets kids.
	tagForChildDirectedTreatment: false,
}

class Admob {
	// Listeners must be registered exactly once for the lifetime of the app,
	// otherwise every showBanner()/interstitial() call leaks a new subscription.
	private bannerListenersRegistered = false
	private interstitialListenersRegistered = false

	// Per-show interstitial close callback (set right before a show).
	private currentInterstitialClose: (() => void) | null = null

	// Interstitial frequency cap: show at most once every N level transitions
	// instead of on every single level.
	private interstitialLevelCounter = 0
	private readonly interstitialEveryNLevels = 3

	async initialize() {
		await AdMob.initialize(AdMobInitializationOptions)

		const [trackingInfo, consentInfo] = await Promise.all([
			AdMob.trackingAuthorizationStatus(),
			AdMob.requestConsentInfo(),
		])

		if (trackingInfo.status === 'notDetermined') {
			// console.log('Display information before ads load first time')
		} else if (
			trackingInfo.status === 'authorized' &&
			consentInfo.isConsentFormAvailable &&
			consentInfo.status === AdmobConsentStatus.REQUIRED
		) {
			await AdMob.showConsentForm()
		}
	}

	async showBanner() {
		if (!this.bannerListenersRegistered) {
			AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
				// Subscribe Banner Event Listener
			})

			AdMob.addListener(
				BannerAdPluginEvents.SizeChanged,
				(_size: AdMobBannerSize) => {
					// Subscribe Change Banner Size
				}
			)

			this.bannerListenersRegistered = true
		}

		const options: BannerAdOptions = {
			adId: 'ca-app-pub-9702825788968948/4586124603',
			adSize: BannerAdSize.BANNER,
			position: BannerAdPosition.BOTTOM_CENTER,
			margin: 0,
			isTesting: import.meta.env.VITE_APP_MODE === 'TEST',
			// npa: true
		}

		await AdMob.showBanner(options)
	}

	async resumeBanner() {
		await AdMob.resumeBanner()
	}

	async hideBanner() {
		await AdMob.hideBanner()
	}

	async removeBanner() {
		await AdMob.removeBanner()
	}

	// Resolve the currently pending interstitial exactly once, then clear it so
	// the (single) listeners cannot fire stale callbacks on a later cycle.
	private resolveInterstitial() {
		const close = this.currentInterstitialClose
		this.currentInterstitialClose = null
		if (close) close()
	}

	private ensureInterstitialListeners() {
		if (this.interstitialListenersRegistered) return

		AdMob.addListener(InterstitialAdPluginEvents.Loaded, (_info: AdLoadInfo) => {
			// Subscribe Interstitial Loaded Event
		})
		AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
			this.resolveInterstitial()
		})
		AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
			this.resolveInterstitial()
		})
		AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
			this.resolveInterstitial()
		})

		this.interstitialListenersRegistered = true
	}

	async interstitial({
		isFirst,
		onInterstitialAdClosed,
	}: {
		isFirst: boolean
		onInterstitialAdClosed: () => void
	}) {
		// Never show on the very first level, and never block the game loop:
		// always let the caller's promise resolve.
		if (isFirst) {
			onInterstitialAdClosed()
			return
		}

		// Frequency cap: only show an interstitial every Nth level transition
		// instead of on every level.
		this.interstitialLevelCounter += 1
		if (this.interstitialLevelCounter % this.interstitialEveryNLevels !== 0) {
			onInterstitialAdClosed()
			return
		}

		this.ensureInterstitialListeners()
		this.currentInterstitialClose = onInterstitialAdClosed

		const options: AdOptions = {
			adId: 'ca-app-pub-9702825788968948/8241194933',
			isTesting: import.meta.env.VITE_APP_MODE === 'TEST',
			// npa: true
		}

		try {
			await AdMob.prepareInterstitial(options)
			await AdMob.showInterstitial()
		} catch (error) {
			// If prepare/show fails, don't leave the game loop hanging.
			this.resolveInterstitial()
		}
	}
}

export default new Admob()
