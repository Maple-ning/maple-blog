<script setup lang="ts"></script>

<template>
  <div class="app-root">
    <header class="top-bar-bg">
      <ul>
        <li><router-link to="/">Ref全家桶</router-link></li>
        <li><router-link to="/reactive">Reactive全家桶</router-link></li>
      </ul>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  header {
    height: 60px;
  }
  header > ul {
    display: flex;
    justify-content: center;
    li {
      line-height: 60px;
    }
    li + li {
      margin-left: 16px;
    }
  }
  main {
    flex: 1;
  }
}
</style>
