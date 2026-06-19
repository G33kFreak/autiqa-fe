<script setup lang="ts">
import CarDetail from '~/components/fleet/detail/CarDetail.vue';

const route = useRoute();
const carId = computed(() => String(route.params.id || ''));
</script>

<template>
  <CarDetail :car-id="carId" />
</template>
