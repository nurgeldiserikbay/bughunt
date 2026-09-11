import {
	AdMob,
	BannerAdSize,
	BannerAdPosition,
	BannerAdPluginEvents,
	AdMobBannerSize,
	BannerAdOptions,
	InterstitialAdPluginEvents,
	AdLoadInfo,
	AdOptions,
	MaxAdContentRating,
} from '@capacitor-community/admob'
import { App as CapacitorApp } from '@capacitor/app'
import { StatusBar } from '@capacitor/status-bar'
import { Fullscreen } from '@boengli/capacitor-fullscreen'

// The Play Console target audience of this game includes children, so Families
// policy applies: every ad request must be tagged as child-directed, capped at
// G-rated inventory and non-personalized. Trading these flags for eCPM is what
// gets an update rejected for "ad content not consistent with the app's content
// rating", so they stay on.
const AdMobInitializationOptions = {
	testingDevices: ['8a1b4b83d67add00', '1f6e845f97c74f32', 'e81b6ee74e7f26dc'],
	// Enable test ads only during local development, never in production builds.
	initializeForTesting: import.meta.env.DEV,
	tagForChildDirectedTreatment: true,
	tagForUnderAgeOfConsent: true,
	maxAdContentRating: MaxAdContentRating.General,
}

// Last-resort guard in case Dismissed never arrives. It releases the game flow
// only - never the system bars, because the ad may still be on screen and
// re-hiding them would push its close button out of reach.
// Резерв под баннер: примерно столько занимает adaptive-баннер на телефоне.
// Пока настоящая высота неизвестна, рекламная зона стоит на этом значении и
// никогда не бывает нулевой — иначе вёрстка прыгает при приходе объявления.
const BANNER_RESERVE_HEIGHT = 56

const INTERSTITIAL_WATCHDOG_MS = 25_000

class Admob {
	/** Куда сообщать о состоянии слота. Ставится из App.vue до initialize(). */
	private bannerListener: ((live: boolean, height: number) => void) | null = null

	/**
	 * Стоит ли на экране настоящее объявление.
	 *
	 * Отдельный флаг нужен потому, что `SizeChanged` о наличии объявления не
	 * говорит ничего: плагин рассылает его и на загрузке — с настоящим размером,
	 * и на отказе, скрытии, снятии — с нулями. Если считать слот живым по любому
	 * из них, после снятия баннера слот останется «живым» с нулевой высотой:
	 * кросс-промо спрячется, а на его месте будет пустая полоса.
	 */
	private bannerLoaded = false
	/** Последняя известная высота объявления. */
	private bannerHeightPx = 0

	// Listeners must be registered exactly once for the lifetime of the app,
	// otherwise every showBanner()/interstitial() call leaks a new subscription.
	private bannerListenersRegistered = false
	private interstitialListenersRegistered = false

	// Per-show interstitial close callback (set right before a show).
	private currentInterstitialClose: (() => void) | null = null
	/** False while a show cycle is still considered active. */
	private interstitialClosed = true
	/** The app went to background during this show - the ad activity opened. */
	private sawBackgroundDuringShow = false
	private watchdogId: ReturnType<typeof setTimeout> | undefined
	/** Preloaded-ad state: a show only happens when an ad is already loaded. */
	private interstitialReady = false
	private interstitialLoading = false
	/** System bars were raised for an ad and still need to be put back. */
	private barsShownForAd = false

	// Interstitial frequency cap: show at most once every N level transitions
	// instead of on every single level.
	private interstitialLevelCounter = 0
	private readonly interstitialEveryNLevels = 3

	// initialize() is what applies the child-directed request configuration, so
	// no ad may be requested before it has finished — an early request is served
	// from adult-rated inventory. The promise is cached so the ad entry points
	// await the same initialization instead of starting a second one.
	private initPromise: Promise<void> | null = null
	private initialized = false

	initialize() {
		if (!this.initPromise) {
			this.initPromise = this.runInitialize()
		}
		return this.initPromise
	}

	private async runInitialize() {
		await AdMob.initialize(AdMobInitializationOptions)
		this.initialized = true

		// Форму согласия UMP осознанно не запрашиваем. Запросы помечены
		// tagForUnderAgeOfConsent, а у пользователя ниже возраста согласия согласие
		// на персонализацию не спрашивают — показывать ему форму выбора
		// персонализации неверно и по GDPR, и по Families Policy.
		// Неперсонализированную выдачу обеспечивает npa: true в каждом запросе.
	}

	/** Подписка страницы на состояние слота. Ставится до initialize(). */
	onBannerChange(listener: (live: boolean, height: number) => void) {
		this.bannerListener = listener
	}

	private publishBanner(live: boolean, height = 0) {
		this.bannerListener?.(live, height)
	}

	/**
	 * Нативный баннер рисуется поверх вебвью, а не внутри вёрстки, поэтому сама
	 * страница о нём ничего не знает. Через эту переменную она узнаёт высоту
	 * объявления и держит под него место.
	 *
	 * Это же и есть защита от «реклама перекрывает управление»: adaptive-баннер
	 * на планшете вырастает почти вдвое против телефонного, и фиксированный
	 * отступ под него промахивается.
	 *
	 * `null` — вернуться к резерву из вёрстки. Место при этом не исчезает: в нём
	 * просто снова появляется кросс-промо.
	 */
	private setSlotHeight(px: number | null) {
		if (typeof document === 'undefined') return
		const root = document.documentElement.style
		if (px === null) root.removeProperty('--ad-slot')
		else root.setProperty('--ad-slot', `${Math.max(44, Math.round(px))}px`)
	}

	/**
	 * Добавляет к рекламной зоне системный инсет — туда же, куда система
	 * отодвинула баннер.
	 *
	 * Ставится и снимается вместе с самим объявлением, а не один раз при старте:
	 * когда баннера нет, отодвигать не подо что — в полосе стоит кросс-промо, и
	 * лишний инсет оставит под ним пустую кромку.
	 *
	 * Само число здесь не считается и не может: его знает браузер и отдаёт через
	 * `env(safe-area-inset-bottom)`. Переменной присваивается выражение, а не
	 * результат: инсет меняется вместе с системными панелями, и вычислять его
	 * должен CSS. Требует `viewport-fit=cover` в `index.html`.
	 */
	private setBannerInset(on: boolean) {
		if (typeof document === 'undefined') return
		const root = document.documentElement.style
		if (on) root.setProperty('--ad-inset', 'env(safe-area-inset-bottom, 0px)')
		else root.removeProperty('--ad-inset')
	}

	/** Слот пуст: место остаётся, но в нём снова кросс-промо. */
	private clearBanner() {
		this.bannerLoaded = false
		this.bannerHeightPx = 0
		this.setSlotHeight(null)
		this.setBannerInset(false)
		this.publishBanner(false)
	}

	async showBanner() {
		// Wait for the child-directed configuration; if initialization failed there
		// is no safe way to request an ad, so show none.
		await this.initialize().catch((error) => console.log(error))
		if (!this.initialized) return

		if (!this.bannerListenersRegistered) {
			AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
				this.bannerLoaded = true
				this.setBannerInset(true)
				this.publishBanner(true, this.bannerHeightPx || BANNER_RESERVE_HEIGHT)
			})

			AdMob.addListener(
				BannerAdPluginEvents.SizeChanged,
				(size: AdMobBannerSize) => {
					// Нули означают, что баннера на экране нет: отказ, скрытие или
					// снятие. Не «объявление нулевой высоты», а его отсутствие.
					if (!size.height) {
						this.clearBanner()
						return
					}

					// Настоящая высота заменяет резерв, как только стала известна. О
					// самом наличии объявления это событие не говорит, поэтому
					// состояние слота остаётся тем, какое было.
					this.bannerHeightPx = size.height
					this.setSlotHeight(size.height)
					this.setBannerInset(true)
					this.publishBanner(this.bannerLoaded, size.height)
				}
			)

			// Нет заполнения, нет сети, нет объявления: место остаётся за слотом,
			// но рисует в нём снова кросс-промо. Обнулять резерв нельзя — вёрстка
			// прыгнет ровно так же, как прыгала при появлении баннера.
			AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
				this.clearBanner()
			})

			this.bannerListenersRegistered = true
		}

		const options: BannerAdOptions = {
			adId: 'ca-app-pub-9702825788968948/4586124603',
			// ADAPTIVE_BANNER, а не BANNER: фиксированный 320x50 не растягивается на ширину
			// экрана, и плагин центрирует его боковыми маргинами — а слушатель инсетов на
			// Android 15+ эти маргины обнуляет, из-за чего баннер уезжает к левому краю.
			adSize: BannerAdSize.ADAPTIVE_BANNER,
			position: BannerAdPosition.BOTTOM_CENTER,
			margin: 0,
			isTesting: import.meta.env.VITE_APP_MODE === 'TEST',
			npa: true,
		}

		await AdMob.showBanner(options)

		// Warm up the interstitial so the show point never waits on a load.
		void this.preloadInterstitial()
	}

	async resumeBanner() {
		await AdMob.resumeBanner()
	}

	async hideBanner() {
		await AdMob.hideBanner()
		// Объявление ушло с экрана — слот снова наш.
		this.clearBanner()
	}

	async removeBanner() {
		await AdMob.removeBanner()
		this.clearBanner()
	}

	// The ad has definitely left the screen.
	private handleInterstitialClosed() {
		this.releaseInterstitialFlow()
		this.restoreBarsAfterAd()
	}

	// Resolve the currently pending interstitial exactly once, then clear it so
	// the (single) listeners cannot fire stale callbacks on a later cycle. The
	// system bars are deliberately left alone here: the watchdog also calls this
	// while the ad may still be on screen, and re-hiding them at that point would
	// push the ad's close button out of reach.
	private releaseInterstitialFlow() {
		if (this.interstitialClosed) return
		this.interstitialClosed = true
		this.sawBackgroundDuringShow = false
		if (this.watchdogId) {
			clearTimeout(this.watchdogId)
			this.watchdogId = undefined
		}
		const close = this.currentInterstitialClose
		this.currentInterstitialClose = null
		if (close) close()

		void this.preloadInterstitial()
	}

	// Restore the game's immersive mode once, and only after the ad is gone.
	private restoreBarsAfterAd() {
		if (!this.barsShownForAd) return
		this.barsShownForAd = false
		void this.restoreImmersiveMode()
	}

	/**
	 * The system bars must be visible while a full screen ad is up. The ad activity
	 * belongs to the SDK and Android 15 draws it edge-to-edge, so if the game keeps
	 * immersive mode the close button can end up under the navigation bar or the
	 * cutout - exactly what review calls "unclosable ads".
	 */
	private async showSystemBars() {
		this.barsShownForAd = true

		try {
			await Fullscreen.deactivateImmersiveMode()
			await StatusBar.show()
		} catch (error) {
			console.log(error)
		}
	}

	private async restoreImmersiveMode() {
		try {
			await Fullscreen.activateImmersiveMode()
			await StatusBar.hide()
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * Loads an ad ahead of the show point, so the show point itself never waits -
	 * waiting on a load is exactly the "ads interfere with app use" complaint.
	 */
	async preloadInterstitial() {
		if (!this.initialized) return
		if (this.interstitialReady || this.interstitialLoading) return

		this.ensureInterstitialListeners()
		this.interstitialLoading = true

		try {
			await AdMob.prepareInterstitial(this.interstitialOptions())
			this.interstitialReady = true
		} catch (error) {
			console.log(error)
			this.interstitialReady = false
		} finally {
			this.interstitialLoading = false
		}
	}

	private interstitialOptions(): AdOptions {
		return {
			adId: 'ca-app-pub-9702825788968948/8241194933',
			isTesting: import.meta.env.VITE_APP_MODE === 'TEST',
			npa: true,
			// Deliberately not setting immersiveMode: since Android 15 forces
			// edge-to-edge it pushes the ad's close button under the navigation bar
			// or cutout, making the ad unclosable - a Families policy rejection.
		}
	}

	private ensureInterstitialListeners() {
		if (this.interstitialListenersRegistered) return

		AdMob.addListener(InterstitialAdPluginEvents.Loaded, (_info: AdLoadInfo) => {
			this.interstitialReady = true
			this.interstitialLoading = false
		})
		AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
			this.interstitialReady = false
			this.handleInterstitialClosed()
		})
		AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
			this.interstitialReady = false
			this.interstitialLoading = false
			this.handleInterstitialClosed()
		})
		AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
			this.interstitialReady = false
			this.handleInterstitialClosed()
		})

		// A second dismissal signal that does not depend on the plugin: Dismissed is
		// lost on some devices, while the app returning to the foreground after a
		// background trip means the ad's own activity has already finished.
		CapacitorApp.addListener('appStateChange', ({ isActive }) => {
			if (!isActive) {
				if (!this.interstitialClosed) this.sawBackgroundDuringShow = true
				return
			}

			if (!this.interstitialClosed && this.sawBackgroundDuringShow) {
				this.handleInterstitialClosed()
			} else {
				this.restoreBarsAfterAd()
			}
		})

		this.interstitialListenersRegistered = true
	}

	async interstitial({
		isFirst = false,
		onInterstitialAdClosed,
	}: {
		isFirst?: boolean
		onInterstitialAdClosed?: () => void
	} = {}) {
		// Every bail-out branch invokes the callback synchronously: a show point is
		// never left hanging while an ad loads.
		const done = onInterstitialAdClosed ?? (() => {})

		// Never show on the very first level, and never block the game loop.
		if (isFirst || !this.initialized) {
			done()
			return
		}

		this.ensureInterstitialListeners()

		// Frequency cap: only show an interstitial every Nth level transition
		// instead of on every level.
		this.interstitialLevelCounter += 1
		if (this.interstitialLevelCounter % this.interstitialEveryNLevels !== 0) {
			done()
			void this.preloadInterstitial()
			return
		}

		// No ad loaded yet - skip this slot and warm up the next one rather than
		// making the player wait.
		if (!this.interstitialReady) {
			done()
			void this.preloadInterstitial()
			return
		}

		this.interstitialReady = false
		this.currentInterstitialClose = done
		this.interstitialClosed = false
		this.sawBackgroundDuringShow = false

		await this.showSystemBars()
		this.watchdogId = setTimeout(() => {
			console.log('Interstitial dismiss watchdog fired')
			this.releaseInterstitialFlow()
		}, INTERSTITIAL_WATCHDOG_MS)

		try {
			await AdMob.showInterstitial()
		} catch (error) {
			console.log(error)
			this.handleInterstitialClosed()
		}
	}
}

export default new Admob()
