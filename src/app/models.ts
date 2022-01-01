export interface TableRow {
  name: string;
  position: number;
  secondHandMinPrice?: number;
  secondHandAveragePrice?: number;
  secondHandMaxPrice?: number;
  newMinPrice?: number;
  newAveragePrice?: number;
  newMaxPrice?: number;
}

export interface SelectValue {
  value?: string;
  text?: string;
}
