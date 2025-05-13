<script lang="ts" setup>
defineProps<{
  count: number
}>()
</script>

<template>
  <div class="bug-counter">
    <div class="bug-counter__in">
      <img src="@/assets/img/__red_beetle_idle.png" alt="" />
      <div class="bug-counter__value">{{ count }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bug-counter {
  position: absolute;
  bottom: 60px;
  left: 20px;
  z-index: 300;
  pointer-events: none;

  &__in {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    line-height: 1;
    padding: 2px 5px 2px 7px;
    box-sizing: border-box;
    gap: 15px;
    color: #000;
    font-size: 22px;
    letter-spacing: 2px;
    backdrop-filter: blur(3px);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);

    img {
      width: 18px;
      opacity: 0.8;
      display: block;
    }
  }

  &__value {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 1;
    vertical-align: middle;
    text-align: center;
    color: #fff;
    -webkit-text-stroke: 2px black;
    text-stroke: 2px black;

		@media screen and (max-width: 480px) {
			transform: translateY(3px);
		}
  }
}
</style> 