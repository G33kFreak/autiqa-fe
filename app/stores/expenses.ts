import { defineStore } from 'pinia';
import type { CreateExpenseDto } from '#shared/dto/create-expense.dto';
import type { ExpenseDto } from '#shared/dto/expense.dto';
import type { ListExpensesQueryDto } from '#shared/dto/list-expenses-query.dto';
import type { PaginatedExpensesResponseDto } from '#shared/dto/paginated-expenses-response.dto';
import {
  createExpense as createExpenseRequest,
  getExpenses,
} from '../api/expenses';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useExpensesStore = defineStore('expenses', () => {
  const { authenticatedApi } = useApi();

  const page = ref(DEFAULT_PAGE);
  const limit = ref(DEFAULT_LIMIT);
  const carId = ref<string | undefined>(undefined);
  const driverId = ref<string | undefined>(undefined);
  const type = ref<string | undefined>(undefined);

  async function loadExpenses(): Promise<PaginatedExpensesResponseDto> {
    const query: ListExpensesQueryDto = {
      page: page.value,
      limit: limit.value,
      carId: carId.value,
      driverId: driverId.value,
      type: type.value,
    };

    return await getExpenses(authenticatedApi, query);
  }

  const vm = useLazyViewModel<PaginatedExpensesResponseDto>({
    load: loadExpenses,
  });

  const items = computed(() => vm.data.value?.data ?? []);
  const meta = computed(() => vm.data.value?.meta ?? null);
  /** True after the list has been loaded at least once. */
  const listResolved = computed(() => vm.data.value !== undefined);

  const creating = ref(false);

  async function getViewModel(): Promise<PaginatedExpensesResponseDto | null> {
    return vm.getViewModel();
  }

  function reset() {
    vm.reset();
    creating.value = false;
  }

  /**
   * Refetch for current/overridden pagination and filters — clears lazy cache first.
   */
  async function fetchExpenses(overrides?: Partial<ListExpensesQueryDto>) {
    if (overrides?.page !== undefined) page.value = overrides.page;
    if (overrides?.limit !== undefined) limit.value = overrides.limit;
    if (overrides?.carId !== undefined) carId.value = overrides.carId;
    if (overrides?.driverId !== undefined) driverId.value = overrides.driverId;
    if (overrides?.type !== undefined) type.value = overrides.type;

    vm.reset();
    return vm.getViewModel();
  }

  /**
   * Direct query helper without changing current store filters.
   */
  async function getExpensesByQuery(
    query: ListExpensesQueryDto,
  ): Promise<PaginatedExpensesResponseDto> {
    return await getExpenses(authenticatedApi, query);
  }

  async function createExpense(payload: CreateExpenseDto): Promise<ExpenseDto> {
    creating.value = true;
    try {
      const created = await createExpenseRequest(authenticatedApi, payload);
      if (vm.data.value) {
        vm.data.value = {
          ...vm.data.value,
          data: [created, ...vm.data.value.data],
        };
      } else {
        await getViewModel();
      }
      return created;
    } finally {
      creating.value = false;
    }
  }

  return {
    items,
    meta,
    loading: vm.loading,
    creating,
    page,
    limit,
    carId,
    driverId,
    type,
    listResolved,
    getViewModel,
    reset,
    fetchExpenses,
    getExpensesByQuery,
    createExpense,
  };
});
