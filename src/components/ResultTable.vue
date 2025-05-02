<script lang="ts" setup>
withDefaults(
	defineProps<{
		level: number
		result: any
	}>(),
	{}
)

const $emits = defineEmits(['close'])
</script>

<template>
	<div class="result">
		<div class="result__in">
			<div class="result__title">{{ `Round ${level}` }}</div>
			<div class="result__table">
				<div class="result__item">
					<img src="@/assets/img/star.png" alt="" />
					<div>{{ result.score }}</div>
				</div>
				<div class="result__item">
					<img
						src="@/assets/img/__red_beetle_dead.png"
						alt=""
						class="result__dead"
					/>
					<div>{{ result.diedBugs }}</div>
				</div>
				<div class="result__item">
					<div>Total</div>
					<img
						src="@/assets/img/__red_beetle_dead.png"
						alt=""
						class="result__dead"
					/>
					<div>{{ result.allDiedBugs }}</div>
				</div>
			</div>
			<button class="result__btn" @click="$emits('close')" />
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
		height: 60vh;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: space-around;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
		margin-bottom: 100px;
		width: 70%;
		backdrop-filter: blur(3px);
		border-radius: 18px;
		font-size: 22px;
		color: red;
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
		font-size: 28px;
		text-align: center;
	}

	&__title {
		font-size: 26px;
		margin-bottom: 15px;
	}

	&__item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: center;
		font-size: 25px;

		img {
			width: 35px;
		}
	}

	&__item &__dead {
		width: 50px;
	}

	&__btn {
		flex-shrink: 0;
		display: block;
		width: 46px;
		height: 46px;
		background-color: transparent;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		background-size: cover;
		background-color: transparent;
		background-image: url('@/assets/img/home.png');
	}
}
</style>
