<script setup lang="ts">
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import { DriversBatchCreateError } from '~/utils/drivers-batch-error';

const { t } = useI18n();
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
    await driversStore.createDrivers(payloads as CreateDriverDto[]);
    close();
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
      <section class="add-driver-dialog__body">
        <article
          v-for="(row, index) in rows"
          :id="`add-driver-card-${row.id}`"
          :key="row.id"
          class="add-driver-dialog__card add-driver-dialog__card--active"
          :class="{ 'add-driver-dialog__card--error': failedRowIndices.has(index) }"
        >
          <div class="add-driver-dialog__accent" aria-hidden="true" />
          <div class="add-driver-dialog__card-head">
            <div class="add-driver-dialog__card-title-wrap">
              <span class="material-symbols-outlined" aria-hidden="true">person_add</span>
              <h3 class="add-driver-dialog__card-title">
                {{ t('appSections.drivers.dialog.newDriver') }} {{ index + 1 }}
              </h3>
            </div>
            <button
              v-if="rows.length > 1"
              type="button"
              class="add-driver-dialog__remove-btn"
              :disabled="driversStore.creating"
              @click="removeRow(row.id)"
            >
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>

          <div class="add-driver-dialog__grid">
            <label class="add-driver-dialog__field">
              <span>{{ t('appSections.drivers.dialog.firstName') }}</span>
              <input
                :id="`add-driver-first-name-${row.id}`"
                v-model="row.firstName"
                class="ti-input add-driver-dialog__input"
                type="text"
                :placeholder="t('appSections.drivers.dialog.firstNamePlaceholder')"
              >
            </label>
            <label class="add-driver-dialog__field">
              <span>{{ t('appSections.drivers.dialog.lastName') }}</span>
              <input
                v-model="row.lastName"
                class="ti-input add-driver-dialog__input"
                type="text"
                :placeholder="t('appSections.drivers.dialog.lastNamePlaceholder')"
              >
            </label>
            <label class="add-driver-dialog__field">
              <span>{{ t('appSections.drivers.dialog.email') }}</span>
              <div class="add-driver-dialog__input-wrap">
                <span class="material-symbols-outlined add-driver-dialog__input-icon" aria-hidden="true">mail</span>
                <input
                  v-model="row.email"
                  class="ti-input add-driver-dialog__input add-driver-dialog__input--icon"
                  type="email"
                  :placeholder="t('appSections.drivers.dialog.emailPlaceholder')"
                >
              </div>
            </label>
            <label class="add-driver-dialog__field">
              <span>{{ t('appSections.drivers.dialog.phoneNumber') }}</span>
              <div class="add-driver-dialog__input-wrap">
                <span class="material-symbols-outlined add-driver-dialog__input-icon" aria-hidden="true">phone</span>
                <input
                  v-model="row.phoneNumber"
                  class="ti-input add-driver-dialog__input add-driver-dialog__input--icon"
                  type="tel"
                  :placeholder="t('appSections.drivers.dialog.phoneNumberPlaceholder')"
                >
              </div>
            </label>
          </div>
        </article>

        <button
          type="button"
          class="add-driver-dialog__add-another"
          :disabled="driversStore.creating"
          @click="addAnother"
        >
          <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
          {{ t('appSections.drivers.dialog.addAnother') }}
        </button>
      </section>
    </template>
    <template #footer>
      <div class="add-driver-dialog__footer">
        <p v-if="formError" class="add-driver-dialog__error" role="alert">
          {{ formError }}
        </p>
        <button
          type="button"
          class="add-driver-dialog__btn add-driver-dialog__btn--ghost"
          :disabled="driversStore.creating"
          @click="close"
        >
          {{ t('appSections.drivers.dialog.cancel') }}
        </button>
        <button
          type="button"
          class="add-driver-dialog__btn add-driver-dialog__btn--primary"
          :disabled="driversStore.creating"
          @click="onSubmit"
        >
          {{
            driversStore.creating
              ? t('appSections.drivers.dialog.submitting')
              : t('appSections.drivers.dialog.submit')
          }}
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </template>
  </EntityDialogShell>
</template>

<style scoped>
.add-driver-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-driver-dialog__card {
  border-radius: 0.75rem;
  background: var(--color-surface-container-low);
}

.add-driver-dialog__card--active {
  position: relative;
  padding: 1.2rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
}

.add-driver-dialog__card--error {
  background: color-mix(in srgb, var(--color-error) 8%, var(--color-surface-container-lowest));
}

.add-driver-dialog__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--color-secondary);
  border-radius: 0.75rem 0 0 0.75rem;
}

.add-driver-dialog__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.add-driver-dialog__card-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-secondary);
}

.add-driver-dialog__card-title {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 1rem;
  font-weight: 700;
}

.add-driver-dialog__remove-btn {
  border: none;
  border-radius: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.add-driver-dialog__remove-btn:hover {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-on-surface);
}

.add-driver-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.add-driver-dialog__field {
  min-width: 0;
}

.add-driver-dialog__field > span {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.add-driver-dialog__input-wrap {
  position: relative;
}

.add-driver-dialog__input-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--color-outline);
  pointer-events: none;
}

.add-driver-dialog__input {
  padding: 0.7rem 0.8rem;
}

.add-driver-dialog__input--icon {
  padding-left: 2.25rem;
}

.add-driver-dialog__add-another {
  border: 2px dashed color-mix(in srgb, var(--color-outline-variant) 50%, transparent);
  border-radius: 0.75rem;
  padding: 0.8rem;
  background: transparent;
  color: var(--color-on-surface-variant);
  font-size: 0.8125rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.add-driver-dialog__add-another:hover {
  color: var(--color-secondary);
  border-color: color-mix(in srgb, var(--color-secondary) 50%, transparent);
  background: color-mix(in srgb, var(--color-secondary) 6%, transparent);
}

.add-driver-dialog__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.55rem;
}

.add-driver-dialog__error {
  margin: 0;
  margin-right: auto;
  font-size: 0.8125rem;
  color: var(--color-error);
}

.add-driver-dialog__btn {
  border: none;
  border-radius: 0.75rem;
  padding: 0.65rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: opacity 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

.add-driver-dialog__btn:disabled,
.add-driver-dialog__remove-btn:disabled,
.add-driver-dialog__add-another:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.add-driver-dialog__btn--ghost {
  color: var(--color-on-surface);
  background: transparent;
}

.add-driver-dialog__btn--ghost:hover {
  background: var(--color-surface-container-high);
}

.add-driver-dialog__btn--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
}

.add-driver-dialog__btn--primary:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}
</style>
