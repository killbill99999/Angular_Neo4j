/**
 * @description 新品查詢 列表資料欄位
 */
export interface NewItemReq {
  categoryBusiness?: string | null;
  newItemStatus?: number[];
  levelOne?: string[];
  levelTwo?: string[];
  levelThree?: string[];
  newItemName?: string;
  brandId?: string;
  auditStatus?: number[];
  currentPage?: number;
  pageSize?: number;
  createUser?: string[];
  auditUser?: string[];
  asc?: number;
  ascName?: string;
  auditEndDate?: string;
  auditStartDate?: string;
  isItem?: boolean;
  skuNo?: string;
}
