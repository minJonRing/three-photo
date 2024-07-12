<template>
  <Menu />
  <router-view />
</template>
<script>
import Menu from '@/views/menu/index.vue'
export default {
  name: 'Home',
  components: {
    Menu
  },
  setup() {

  }
}
</script>
<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

.nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;

  a {
    display: inline-block;
    padding: 3px 6px;
  }
}
</style>
