<template>
  <div class="driver-details-skeleton">
    <div class="driver-details-skeleton__item driver-details-skeleton__item--header" />
    <div class="driver-details-skeleton__layout">
      <div class="driver-details-skeleton__col">
        <div class="driver-details-skeleton__item driver-details-skeleton__item--lg" />
        <div class="driver-details-skeleton__item driver-details-skeleton__item--lg" />
      </div>
      <div class="driver-details-skeleton__col">
        <div class="driver-details-skeleton__item driver-details-skeleton__item--md" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.driver-details-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-details-skeleton__layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
}

.driver-details-skeleton__col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-details-skeleton__item {
  border-radius: 1rem;
  background: linear-gradient(
    90deg,
    var(--color-surface-container-low) 0%,
    var(--color-surface-container) 50%,
    var(--color-surface-container-low) 100%
  );
  background-size: 220% 100%;
  animation: driver-details-shimmer 1.5s ease-in-out infinite;
}

.driver-details-skeleton__item--header {
  min-height: 6rem;
}

.driver-details-skeleton__item--lg {
  min-height: 18rem;
}

.driver-details-skeleton__item--md {
  min-height: 12rem;
}

@keyframes driver-details-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 900px) {
  .driver-details-skeleton__layout {
    grid-template-columns: 1fr;
  }
}
</style>
