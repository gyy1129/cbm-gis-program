<template>
  <vue-particles
    color="#409EFF"
    :particleOpacity="0.7"
    :particlesNumber="60"
    shapeType="circle"
    :particleSize="6"
    linesColor="#409EFF"
    :linesWidth="1"
    :lineLinked="true"
    :lineOpacity="0.4"
    :linesDistance="150"
    :moveSpeed="3"
    :hoverEffect="true"
    hoverMode="grab"
    :clickEffect="true"
    clickMode="push"
  >
  </vue-particles>
</template>

<script>
export default {
  name: 'background'
}
</script>
<style lang="less" scoped>
#particles-js {
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
