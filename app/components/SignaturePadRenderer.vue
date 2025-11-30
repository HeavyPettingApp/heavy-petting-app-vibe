<script setup>

const props = defineProps({
  svgString: {
    type: String,
    required: true
  }
})

// Create a computed property to ensure reactivity
const sanitizedSvg = computed(() => {

  if (!props.svgString) {
    return ''
  }
  return props.svgString
})
</script>

<template>
  <div class="svg-display-container" v-html="sanitizedSvg"></div>
</template>

<style scoped lang="scss">
.svg-display-container {
  /* You can add styling here to control the container for your SVG */
  display: flex;
  justify-content: center;
  align-items: center;
  /* Example: Set a max-width if you want to constrain the SVG size */
  max-width: 100%;
  height: auto;

  /* Important: Ensure the SVG itself fills its container as needed */
  :deep(svg) {
    width: 100%;
    height: auto;
    display: block;
    /* Remove any extra space below the SVG */
  }
}
</style>