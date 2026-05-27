<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import type { DriverDetailsDto } from '#shared/dto/driver-details.dto';
import type { FileDto } from '#shared/dto/file.dto';
import DriverAssignmentCard from '~/components/drivers/DriverAssignmentCard.vue';
import DriverDetailsSkeleton from '~/components/drivers/DriverDetailsSkeleton.vue';
import DriverDocumentsCard from '~/components/drivers/DriverDocumentsCard.vue';
import DriverPersonalDetailsCard from '~/components/drivers/DriverPersonalDetailsCard.vue';
import DriverProfileHeader from '~/components/drivers/DriverProfileHeader.vue';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import type { DriverDocumentView } from '~/components/drivers/DriverDocumentsCard.vue';

const { t } = useI18n();
const route = useRoute();
const carsStore = useCarsStore();
const driversStore = useDriversStore();
const { openingFileId, openFileInNewTab } = useStorageSignedUrl();

const driverId = computed(() => String(route.params.id || ''));
const detailsLoading = ref(true);
const detailsResolved = ref(false);
const driver = ref<DriverDetailsDto | null>(null);
const assignedCar = ref<CarDto | null>(null);
const isEditing = ref(false);
const assignDialog = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const assignCarsLoading = ref(false);
const assignCars = ref<CarDto[]>([]);
const documents = ref<DriverDocumentView[]>([]);
const documentsUploadSuccessNonce = ref(0);
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
});

const fullName = computed(() => {
  if (!driver.value) return t('appSections.drivers.details.common.emptyValue');
  return `${driver.value.firstName} ${driver.value.lastName}`.trim();
});

const assignmentActionLabel = computed(() => {
  if (!driver.value?.carId) return t('appSections.drivers.details.actions.assignVehicle');
  return t('appSections.drivers.details.actions.assignOtherVehicle');
});

function syncFormFromDriver(source: DriverDetailsDto | null) {
  form.value = {
    firstName: source?.firstName ?? '',
    lastName: source?.lastName ?? '',
    email: source?.email ?? '',
    phoneNumber: source?.phoneNumber ?? '',
  };
}

function startEditMode() {
  syncFormFromDriver(driver.value);
  isEditing.value = true;
}

function cancelEditMode() {
  syncFormFromDriver(driver.value);
  isEditing.value = false;
}

async function saveEditMode() {
  if (!driver.value) return;
  const payload: CreateDriverDto = {
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    email: form.value.email.trim() || undefined,
    phoneNumber: form.value.phoneNumber.trim() || undefined,
  };
  const updated = await driversStore.update(driver.value.id, payload);
  driver.value = {
    ...driver.value,
    ...updated,
    documents: driver.value?.documents ?? [],
  };
  syncFormFromDriver(driver.value);
  isEditing.value = false;
}

async function openAssignCarDialog() {
  assignDialog.value?.showModal();
  assignCarsLoading.value = true;
  try {
    await carsStore.fetchCars({ page: 1, limit: 100 });
    assignCars.value = [...carsStore.items];
  } finally {
    assignCarsLoading.value = false;
  }
}

function closeAssignCarDialog() {
  assignDialog.value?.close();
}

async function assignCarToDriver(car: CarDto) {
  if (!driver.value) return;
  const updatedCar = await carsStore.assignDriverToCar(car.id, driver.value.id);
  assignedCar.value = updatedCar;
  driver.value = {
    ...driver.value,
    carId: updatedCar.id,
  };
  carsStore.reset();
  closeAssignCarDialog();
}

function toDocumentView(file: FileDto): DriverDocumentView {
  return {
    id: file.id,
    name: file.originalName,
    size: file.size,
    mimeType: file.mimetype,
    url: null,
  };
}

function mergeDocumentViews(
  current: DriverDocumentView[],
  incoming: DriverDocumentView[],
): DriverDocumentView[] {
  const byKey = new Map<string, DriverDocumentView>();
  current.forEach((doc) => {
    byKey.set(doc.id || `${doc.name}-${doc.size}-${doc.mimeType || ''}`, doc);
  });
  incoming.forEach((doc) => {
    byKey.set(doc.id || `${doc.name}-${doc.size}-${doc.mimeType || ''}`, doc);
  });
  return Array.from(byKey.values());
}

async function uploadDriverDocuments(files: File[]) {
  if (!driver.value) return;
  const uploaded = await driversStore.uploadDocuments(driver.value.id, files);
  const uploadedViews = uploaded.map(toDocumentView);
  const refreshed = await driversStore.fetchDriverById(driver.value.id);
  if (refreshed) {
    driver.value = refreshed;
    documents.value = mergeDocumentViews(
      refreshed.documents.map(toDocumentView),
      uploadedViews,
    );
  } else {
    documents.value = mergeDocumentViews(documents.value, uploadedViews);
  }
  documentsUploadSuccessNonce.value += 1;
}

async function deleteDriverDocument(docId: string) {
  if (!driver.value) return;
  await driversStore.deleteDocument(driver.value.id, docId);
  documents.value = documents.value.filter((doc) => doc.id !== docId);
}

async function openDriverDocument(docId: string) {
  await openFileInNewTab(docId);
}

useSeoMeta({
  title: computed(() => `${t('appSections.drivers.title')} #${driverId.value}`),
  description: computed(() => t('appSections.drivers.lead')),
});

onMounted(async () => {
  detailsLoading.value = true;
  try {
    driver.value = await driversStore.fetchDriverById(driverId.value);
    syncFormFromDriver(driver.value);
    documents.value = (driver.value?.documents ?? []).map(toDocumentView);
    if (driver.value?.carId) {
      assignedCar.value = await carsStore.fetchCarById(driver.value.carId);
    } else {
      assignedCar.value = null;
    }
  } finally {
    detailsLoading.value = false;
    detailsResolved.value = true;
  }
});
</script>

<template>
  <section class="driver-details-page app-page app-page--wide">
    <div v-if="detailsLoading && !detailsResolved" class="driver-details-page__loading">
      <DriverDetailsSkeleton />
    </div>

    <template v-else-if="driver">
      <AppBreadcrumbs
        :items="[
          { label: t('nav.drivers'), to: '/app/drivers' },
          { label: fullName },
        ]"
      />
      <DriverProfileHeader
        :edit-label="t('appSections.fleet.vehicleDetails.editVehicle')"
        :save-label="t('appSections.fleet.vehicleDetails.save')"
        :saving-label="t('common.loading')"
        :cancel-label="t('appSections.fleet.vehicleDetails.cancel')"
        :full-name="fullName"
        :assignment-action-label="assignmentActionLabel"
        :is-editing="isEditing"
        :is-saving="driversStore.updating"
        @start-edit="startEditMode"
        @save-edit="saveEditMode"
        @cancel-edit="cancelEditMode"
        @assign-car="openAssignCarDialog"
      />

      <section class="driver-details-page__layout">
        <div class="driver-details-page__left">
          <DriverPersonalDetailsCard
            :driver="driver"
            :is-editing="isEditing"
            :form="form"
            @update-form="form = $event"
          />
          <DriverDocumentsCard
            :documents="documents"
            :is-uploading="driversStore.uploadingDocuments"
            :upload-success-nonce="documentsUploadSuccessNonce"
            :deleting-document-id="driversStore.deletingDocumentId"
            :opening-document-id="openingFileId"
            @upload="uploadDriverDocuments"
            @delete-document="deleteDriverDocument"
            @open-document="openDriverDocument"
          />
        </div>

        <div class="driver-details-page__right">
          <DriverAssignmentCard
            :car-id="driver.carId"
            :car-model="assignedCar?.model"
            :car-plate-number="assignedCar?.plateNumber"
          />
        </div>
      </section>

      <EntityDialogShell
        ref="assignDialog"
        title-id="driver-assign-car-dialog-title"
        :title="t('appSections.drivers.details.assignDialog.title')"
        width="min(30rem, calc(100vw - 2rem))"
        :lead="''"
      >
        <template #body>
          <div class="app-dialog-picker">
            <p v-if="assignCarsLoading" class="app-dialog-picker__state">{{ t('common.loading') }}</p>
            <p v-else-if="assignCars.length === 0" class="app-dialog-picker__state">
              {{ t('appSections.drivers.details.assignDialog.noCars') }}
            </p>
            <div v-else class="app-dialog-picker__list">
              <button
                v-for="car in assignCars"
                :key="car.id"
                type="button"
                class="app-dialog-picker__item"
                :disabled="carsStore.updating || driver?.carId === car.id"
                @click="assignCarToDriver(car)"
              >
                <span class="app-dialog-picker__item-name">{{ car.model || t('appSections.drivers.details.assignDialog.unnamedCar') }}</span>
                <span class="app-dialog-picker__item-meta">
                  <span class="app-dialog-picker__chip">
                    {{ car.plateNumber || t('appSections.drivers.details.assignDialog.noPlate') }}
                  </span>
                  <span v-if="driver?.carId === car.id">{{ t('appSections.drivers.details.assignDialog.currentlyAssigned') }}</span>
                </span>
              </button>
            </div>
          </div>
        </template>
      </EntityDialogShell>
    </template>

    <section v-else class="driver-details-page__not-found">
      <h2>{{ t('appSections.drivers.driverNotFoundTitle') }}</h2>
      <p>{{ t('appSections.drivers.driverNotFoundBody') }}</p>
    </section>
  </section>
</template>

<style scoped>
.driver-details-page {
  display: flex;
  flex-direction: column;
  gap: var(--app-section-gap, 2rem);
}

.driver-details-page__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-details-page__layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
}

.driver-details-page__left,
.driver-details-page__right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-details-page__not-found {
  border-radius: 1rem;
  padding: 1.3rem;
  background: var(--color-surface-container-low);
}

.driver-details-page__not-found h2 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  color: var(--color-on-surface);
}

.driver-details-page__not-found p {
  margin: 0;
  color: var(--color-on-surface-variant);
}

@media (max-width: 900px) {
  .driver-details-page__layout {
    grid-template-columns: 1fr;
  }
}
</style>
