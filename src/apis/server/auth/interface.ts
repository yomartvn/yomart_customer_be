export interface AuthVerifyResponse {
  id: number;
  active?: number;
  role_ids?: number[];
  role_id?: number;
  seller_id?: number | null;
  customer_id?: number | null;
}
