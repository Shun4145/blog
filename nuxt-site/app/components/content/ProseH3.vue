<script setup lang="ts">defineProps<{ id?: string }>()</script>
<template><HeadingWithAliases tag="h3" :id="id"><slot /></HeadingWithAliases></template>
