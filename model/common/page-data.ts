export interface PageData<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

export const EMPTY_PAGE: PageData<any> = {
  pageIndex: 0,
  pageSize: 20,
  totalCount: 0,
  data: []
};
