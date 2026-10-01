<script setup>
import MenuBar from "./components/MenuBar.vue";
</script>

<template>
  <v-app>
    <MenuBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
/* OC Academic Edition — typography (see ui-style-system.mdc) */
.v-application {
  font-family: Inter, sans-serif !important;
  font-size: 16px;
  font-weight: 400;
}