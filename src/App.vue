<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  created () {
    document.title = "Puniket Circle Viewer"
  },
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 15px;
  min-width: 700px;
}
</style>
