export interface TableRow {
  name?: string;
  position?: number;
  secondHandMinPrice?: number;
  secondHandMinPriceAsString?: string;
  secondHandMinPriceImages?: HTMLImageElement[];
  secondHandAveragePrice?: number;
  secondHandAveragePriceAsString?: string;
  secondHandAveragePriceImages?: HTMLImageElement[];
  secondHandMaxPrice?: number;
  secondHandMaxPriceAsString?: string;
  secondHandMaxPriceImages?: HTMLImageElement[];
  newMinPrice?: number;
  newMinPriceAsString?: string;
  newMinPriceImages?: HTMLImageElement[];
  newAveragePrice?: number;
  newAveragePriceAsString?: string;
  newAveragePriceImages?: HTMLImageElement[];
  newMaxPrice?: number;
  newMaxPriceAsString?: string;
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

export interface AppForm {
  parePart?: SelectValue[];
  marka?: SelectValue;
  model?: SelectValue;
  yearFrom?: SelectValue;
  yearTo?: SelectValue;
  body?: SelectValue;
  engine?: SelectValue;
  fuel?: SelectValue;
  gear?: SelectValue;
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
  YEAR = "god1",
  FUEL = "toplivo",
  GEAR = "korobka",
  BODY = "kuzov",
  IMAGE_WRAP = "image-wrap",
  BRAZZERS_GALLARY = "brazzers-gallery"
}
