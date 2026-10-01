<script setup lang="ts">defineProps<{ id?: string }>()</script>
<template><HeadingWithAliases tag="h2" :id="id"><slot /></HeadingWithAliases></template>
