<template>
  <router-view></router-view>
</template>
<script>
import * as rem from './utils/rem.js'
export default {
  name: 'App',
  created() {
    // 测试store
    this.$store.commit('changeTest', 'changed')
    this.$store.getters.getterTest
  }
};

</script>
<style lang="scss">
body {
  padding-right: 0px !important;
  overflow: hidden !important;
}
</style>
