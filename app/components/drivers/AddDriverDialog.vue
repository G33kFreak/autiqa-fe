<script setup lang="ts">
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import { DriversBatchCreateError } from '~/utils/drivers-batch-error';

const props = withDefaults(
  defineProps<{
    /** After a successful save, go to the last created driver detail (e.g. from dashboard). */
    navigateToCreatedDetail?: boolean;
  }>(),
  { navigateToCreatedDetail: false },
);

const { t } = useI18n();
const localePath = useLocalePath();
const driversStore = useDriversStore();
const dialogShell = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const formError = ref<string | null>(null);
const failedRowIndices = ref<Set<number>>(new Set());

type DriverFormRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

function newRow(): DriverFormRow {
  return {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  };
}

const rows = ref<DriverFormRow[]>([newRow()]);

function resetForm() {
  formError.value = null;
  failedRowIndices.value = new Set();
  rows.value = [newRow()];
}

function showModal() {
  resetForm();
  dialogShell.value?.showModal();
}

function close() {
  dialogShell.value?.close();
}

function addAnother() {
  const row = newRow();
  rows.value.push(row);
  nextTick(() => {
    const el = document.getElementById(`add-driver-card-${row.id}`);
    el?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    document
      .getElementById(`add-driver-first-name-${row.id}`)
      ?.focus({ preventScroll: true });
  });
}

function removeRow(id: string) {
  if (rows.value.length <= 1) return;
  rows.value = rows.value.filter((row) => row.id !== id);
}

function rowPayload(row: DriverFormRow): CreateDriverDto | null {
  const firstName = row.firstName.trim();
  const lastName = row.lastName.trim();
  if (!firstName.length || !lastName.length) return null;

  const email = row.email.trim();
  const phoneNumber = row.phoneNumber.trim();
  const payload: CreateDriverDto = { firstName, lastName };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+\d][\d\s\-()]{5,}$/;

  if (email.length) {
    if (!emailRegex.test(email)) return null;
    payload.email = email;
  }
  if (phoneNumber.length) {
    if (!phoneRegex.test(phoneNumber)) return null;
    payload.phoneNumber = phoneNumber;
  }
  return payload;
}

async function onSubmit() {
  formError.value = null;
  failedRowIndices.value = new Set();

  const payloads = rows.value.map(rowPayload);
  if (payloads.some((payload) => payload === null)) {
    payloads.forEach((payload, idx) => {
      if (!payload) failedRowIndices.value.add(idx);
    });
    formError.value = t('appSections.drivers.dialog.validation');
    return;
  }

  try {
    const created = await driversStore.createDrivers(payloads as CreateDriverDto[]);
    close();
    if (props.navigateToCreatedDetail && created.length > 0) {
      const id = created[created.length - 1]!.id;
      await navigateTo(localePath(`/app/drivers/${id}`));
    }
  } catch (e) {
    if (e instanceof DriversBatchCreateError) {
      failedRowIndices.value = new Set(e.failedIndices);
      formError.value = e.message.trim() || t('appSections.drivers.dialog.error');
    } else {
      formError.value = t('appSections.drivers.dialog.error');
    }
  }
}

defineExpose({ showModal, close });
</script>

<template>
  <EntityDialogShell
    ref="dialogShell"
    title-id="add-driver-dialog-title"
    :title="t('appSections.drivers.dialog.title')"
    :lead="t('appSections.drivers.dialog.lead')"
  >
    <template #body>
      <div class="app-dialog-stack">
        <AppDialogFormCard
          v-for="(row, index) in rows"
          :id="`add-driver-card-${row.id}`"
          :key="row.id"
          icon="person_add"
          :title="`${t('appSections.drivers.dialog.newDriver')} ${index + 1}`"
          :has-error="failedRowIndices.has(index)"
          :show-remove="rows.length > 1"
          :remove-disabled="driversStore.creating"
          @remove="removeRow(row.id)"
        >
          <div class="app-dialog-grid app-dialog-grid--2">
            <label class="app-dialog-field">
              <span>{{ t('appSections.drivers.dialog.firstName') }}</span>
              <input
                :id="`add-driver-first-name-${row.id}`"
                v-model="row.firstName"
                class="ti-input"
                type="text"
                :placeholder="t('appSections.drivers.dialog.firstNamePlaceholder')"
              >
            </label>
            <label class="app-dialog-field">
              <span>{{ t('appSections.drivers.dialog.lastName') }}</span>
              <input
                v-model="row.lastName"
                class="ti-input"
                type="text"
                :placeholder="t('appSections.drivers.dialog.lastNamePlaceholder')"
              >
            </label>
            <label class="app-dialog-field">
              <span>{{ t('appSections.drivers.dialog.email') }}</span>
              <div class="app-dialog-input-icon-wrap">
                <span class="material-symbols-outlined app-dialog-input-icon" aria-hidden="true">mail</span>
                <input
                  v-model="row.email"
                  class="ti-input app-dialog-input--with-icon"
                  type="email"
                  :placeholder="t('appSections.drivers.dialog.emailPlaceholder')"
                >
              </div>
            </label>
            <label class="app-dialog-field">
              <span>{{ t('appSections.drivers.dialog.phoneNumber') }}</span>
              <div class="app-dialog-input-icon-wrap">
                <span class="material-symbols-outlined app-dialog-input-icon" aria-hidden="true">phone</span>
                <input
                  v-model="row.phoneNumber"
                  class="ti-input app-dialog-input--with-icon"
                  type="tel"
                  :placeholder="t('appSections.drivers.dialog.phoneNumberPlaceholder')"
                >
              </div>
            </label>
          </div>
        </AppDialogFormCard>

        <button
          type="button"
          class="app-dialog-add-another"
          :disabled="driversStore.creating"
          @click="addAnother"
        >
          <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
          {{ t('appSections.drivers.dialog.addAnother') }}
        </button>
      </div>
    </template>
    <template #footer>
      <AppDialogFooter
        :error="formError"
        :cancel-label="t('appSections.drivers.dialog.cancel')"
        :submit-label="
          driversStore.creating
            ? t('appSections.drivers.dialog.submitting')
            : t('appSections.drivers.dialog.submit')
        "
        :cancel-disabled="driversStore.creating"
        :submit-disabled="driversStore.creating"
        submit-type="button"
        @cancel="close"
        @submit="onSubmit"
      />
    </template>
  </EntityDialogShell>
</template>
