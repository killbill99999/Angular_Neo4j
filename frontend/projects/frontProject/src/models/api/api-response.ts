/**
 * @description api 統一回應格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}
