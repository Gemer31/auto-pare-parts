export interface TableRow {
  name?: string;
  position?: number;
  secondHandMinPrice?: number;
  secondHandMinPriceImages?: HTMLImageElement[];
  secondHandAveragePrice?: number;
  secondHandAveragePriceImages?: HTMLImageElement[];
  secondHandMaxPrice?: number;
  secondHandMaxPriceImages?: HTMLImageElement[];
  newMinPrice?: number;
  newMinPriceImages?: HTMLImageElement[];
  newAveragePrice?: number;
  newMaxPrice?: number;
  newMaxPriceImages?: HTMLImageElement[];
}

export interface ElementValues {
  parePartPrice: number;
  images: HTMLImageElement[];
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
  IMAGE_WRAP = "image-wrap",
  BRAZZERS_GALLARY = "brazzers-gallery"
}
