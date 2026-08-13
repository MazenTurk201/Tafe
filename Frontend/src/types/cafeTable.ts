export interface CafeTable {
  id: number;
  name: string;
  capacity: number;
  isOccupied: boolean;
  totalOrders?: number[];
  reservations?: unknown[];
}
