export interface CalculationRecord {
  id: number;
  expression: string;
  result: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
