export interface TableRow {
  name: string;
  position?: number;
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

export enum SiteElementsName {
  CURRENCY_LIST = "currency-list",
  NEXT_BUTTON = "modern-page-next",
  PRICE_BOX = "price-box",
  ITEM_LIST = "item-list",
  NEW = "new",
  TOTAL_PARE_PARTS_COUNT = "js-var_iCount",
  MARKA = "marka",
  ZAPCHAST = "zapchast",
  MODEL = "model",
}
