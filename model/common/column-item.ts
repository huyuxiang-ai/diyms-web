import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';

export interface ColumnItem<T> {
  id: string;
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn?: NzTableSortFn<T> | null;
  listOfFilter?: NzTableFilterList;
  filterFn?: NzTableFilterFn | null;
  filterMultiple?: boolean;
  sortDirections?: NzTableSortOrder[];
  priority?: number;
}
