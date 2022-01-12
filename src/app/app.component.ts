import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { AppForm, ElementValues, SelectValue, SiteElementsName, TableRow } from "./models";
import { MatSnackBar, } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { Observable, Subscriber } from "rxjs";
import { Alignment, Cell, CellValue, Column, Font, Protection, Workbook } from "exceljs";
import * as fs from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  @HostBinding("class.app") public hostClass: boolean = true;

  static defaultURL: string = "https://bamper.by/"

  static getHtml(url: string): Promise<Document> {
    return fetch(url)
      .then((response: Response) => (response.text()))
      .then((htmlAsString: string) => {
        return new DOMParser().parseFromString(htmlAsString, "text/html");
      });
  }

  public _tableData: TableRow[] = [];
  public _pareParts: SelectValue[] = [];
  public _loadingInProgress: boolean = false;
  public _appForm: AppForm = {};
  public _viewerImages: HTMLImageElement[] = [];
  public _viewerTitle: string = "";

  constructor(private snackBar: MatSnackBar) {}

  private prepareUrl(page: number, parePart: SelectValue): string {
    // %2Fkuzov_universal%2Fphoto_Y%2Fstore_Y%2Fenginevalue_1.9&more=Y&PAGEN_1=2
    let url: string = AppComponent.defaultURL + "zchbu/";
    url += `zapchast_${parePart.value}/`;
    if (this._appForm?.marka?.value) {url += `marka_${this._appForm.marka.value}/`;}
    if (this._appForm?.model?.value) {url += `model_${this._appForm.model.value}/`;}
    url += `god_${this._appForm?.yearFrom?.value}-${this._appForm?.yearTo?.value}/`;
    if (this._appForm?.fuel?.value) {url += `toplivo_${this._appForm.fuel.value}/`;}
    if (this._appForm?.gear?.value) {url += `korobka_${this._appForm.gear.value}/`;}
    if (this._appForm?.body?.value) {url += `kuzov_${this._appForm.body.value}/`;}
    // if (this._selectedEngine?.value) {url += `enginevalue${this._selectedEngine.value}/`;}
    url += "photo_Y/store_Y/?ACTION=REWRITED3&FORM_DATA=";
    url += `zapchast_${parePart.value}`;
    if (this._appForm?.marka?.value) {url += `%2Fmarka_${this._appForm.marka.value}`;}
    if (this._appForm?.model?.value) {url += `%2Fmodel_${this._appForm.model.value}`;}
    url += `%2Fgod_${this._appForm?.yearFrom?.value}-${this._appForm?.yearTo?.value}`;
    if (this._appForm?.fuel?.value) {url += `%2Ftoplivo_${this._appForm.fuel.value}`;}
    if (this._appForm?.gear?.value) {url += `%2Fkorobka_${this._appForm.gear.value}`;}
    if (this._appForm?.body?.value) {url += `%2Fkuzov_${this._appForm.body.value}`;}
    // if (this._selectedEngine?.value) {url += `%2Fenginevalue${this._selectedEngine.value}/`;}
    url += `%2Fphoto_Y%2Fstore_Y&more=Y&PAGEN_1=${page}`;
    return url;
  }

  public _calculateClicked(): void {
    this._tableData = [];
    this._loadingInProgress = true;

    (this._appForm?.parePart?.length ? this._appForm.parePart : this._pareParts).forEach((parePart: SelectValue) => {
      parePart.value?.length && this.calculatePrices(
        {
          name: parePart.text as string,
          secondHandMinPrice: 0,
          secondHandAveragePrice: 0,
          secondHandMaxPrice: 0,
          newMinPrice: 0,
          newAveragePrice: 0,
          newMaxPrice: 0
        },
        parePart
      );
    })
  }

  public _exportExcel(): void {
    const workBook = new Workbook();
    let worksheet = workBook.addWorksheet('Car Data');
    worksheet.columns = [
      {
        header: 'No.',
        key: 'No',
        width: 10,
      },
      {
        header: 'Запчасть',
        key: 'parePart',
        width: 32,
      },
      {
        header: 'Минимальная цена',
        key: 'minPrice',
        width: 20,
        values: ["1", "2"]
      },
      {
        header: 'Средняя цена',
        key: 'averagePrice',
        width: 20,
      },
      {
        header: 'Максимальная цена',
        key: 'maxPrice',
        width: 20,
      },
    ];

    worksheet.spliceColumns(3, 2);
    // {
    //   numFmt?: string;
    //   font?: Partial<Font>;
    //   protection?: Partial<Protection>;
    //   values: ReadonlyArray<CellValue>,
    //   width: 20,
    //   outlineLevel: number,
    //   alignment: {
    //     horizontal: 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed';
    //     vertical: 'top' | 'middle' | 'bottom' | 'distributed' | 'justify';
    //     wrapText: boolean;
    //     shrinkToFit: boolean;
    //     indent: number;
    //     readingOrder: 'rtl' | 'ltr';
    //     textRotation: number | 'vertical';
    //   }
    // }


    // const header = ["No.", "Запчасть", "Минимальная цена", "Средняя цена", "Максимальная цена"]
    // let headerRow = worksheet.addRow(header);
    // headerRow.eachCell((cell: Cell) => {
    //   cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    // });

    this._tableData.forEach((row: TableRow) => {
      worksheet.addRow([
        row.position,
        row.name,
        row.secondHandMinPrice,
        row.newMinPrice,
        row.secondHandAveragePrice,
        // row.newAveragePrice,
        // row.secondHandMaxPrice,
        // row.newMaxPrice,
      ])
    })

    workBook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Запчасти.xlsx');
    });

    this.snackBar.open("Таблица сохранена", "", {
      horizontalPosition: "center",
      verticalPosition: "bottom",
      duration: 3000,
    });
  }

  public _openImageViewer(images: HTMLImageElement[], title: string): void {
    this._viewerTitle = title;
    this._viewerImages = images;
  }

  private calculatePrices(
    parePartModel: TableRow,
    parePart?: SelectValue
  ): void {
    new Observable<Element[]>((observer: Subscriber<Element[]>) => {
      this.loadElements(observer, [], 1, parePart);
    }).subscribe((elements: Element[]) => {
      let nemElements: Element[] = [];
      let secondHandElements: Element[] = [];
      let elementValues: ElementValues;

      elements?.forEach((element: Element) => {
        !!element.getElementsByClassName(SiteElementsName.NEW)?.length
          ? nemElements.push(element)
          : secondHandElements.push(element);
      })

      nemElements?.forEach((element: Element) => {
        elementValues = this.getElementValues(element);

        if (!parePartModel.newMinPrice || parePartModel.newMinPrice > elementValues.parePartPrice) {
          parePartModel.newMinPriceImages = elementValues.images;
          parePartModel.newMinPrice = elementValues.parePartPrice;
        }
        if (!parePartModel.newMaxPrice || parePartModel.newMaxPrice < elementValues.parePartPrice) {
          parePartModel.newMaxPriceImages = elementValues.images;
          parePartModel.newMaxPrice = elementValues.parePartPrice;
        }
        parePartModel.newAveragePrice = !parePartModel.newAveragePrice
          ? elementValues.parePartPrice
          : parePartModel.newAveragePrice + elementValues.parePartPrice;
      });

      secondHandElements?.forEach((element: Element) => {
        elementValues = this.getElementValues(element);

        if (!parePartModel.secondHandMinPrice || parePartModel.secondHandMinPrice > elementValues.parePartPrice) {
          parePartModel.secondHandMinPriceImages = elementValues.images;
          parePartModel.secondHandMinPrice = elementValues.parePartPrice;
        }
        if (!parePartModel.secondHandMaxPrice || parePartModel.secondHandMaxPrice < elementValues.parePartPrice) {
          parePartModel.secondHandMaxPriceImages = elementValues.images;
          parePartModel.secondHandMaxPrice = elementValues.parePartPrice;
        }
        parePartModel.secondHandAveragePrice = !parePartModel.secondHandAveragePrice
          ? elementValues.parePartPrice
          : parePartModel.secondHandAveragePrice + elementValues.parePartPrice;
      });

      const secondHandAveragePrice: number = (parePartModel?.secondHandAveragePrice || 0) / secondHandElements?.length;
      const newAveragePrice: number = (parePartModel.newAveragePrice || 0) / nemElements?.length;

      this._tableData = [ ...this._tableData, {
        ...parePartModel,
        position: this._tableData.length + 1,
        secondHandAveragePrice,
        secondHandAveragePriceImages: this.getAveragePriceImages(secondHandElements, secondHandAveragePrice),
        newAveragePrice,
        newAveragePriceImages: this.getAveragePriceImages(nemElements, newAveragePrice),
      }];

      if ((!!this._appForm.parePart?.length
        ? this._appForm.parePart.length
        : this._pareParts?.length) === this._tableData?.length) {
        this._loadingInProgress = false;
      }
    });
  }

  private getAveragePriceImages(elements: Element[], price: number): HTMLImageElement[] {
    return price
      ? this.getElementImages(elements?.reverse()?.find((element: Element) => (this.getElementPrice(element) <= price)) as Element)
      : [];
  }

  private getElementPrice(element: Element): number {
    const value = element
      ?.getElementsByClassName(SiteElementsName.CURRENCY_LIST)
      ?.item(0)?.innerHTML
      ?.trim();
    return Number(value?.substring(1, value.length - 1));
  }

  private getElementImages(element: Element): HTMLImageElement[] {
    const images: HTMLImageElement[] = Array.from(element?.getElementsByClassName("thumbnail no-margin")) as HTMLImageElement[] || [];
    images?.forEach((img: HTMLImageElement) => { img.src = img.src.replace(window?.location?.href, AppComponent.defaultURL) });
    return images;
  }

  private getElementValues(element: Element): ElementValues {
    return {
      parePartPrice: this.getElementPrice(element),
      images: this.getElementImages(element)
    };
  }

  private loadElements(
    observer: Subscriber<Element[]>,
    elements: Element[],
    page: number,
    parePart?: SelectValue
  ): void {
    AppComponent.getHtml(this.prepareUrl(page, parePart as SelectValue))
      .then((html: Document) => {
        Array.from(html.getElementsByClassName(SiteElementsName.ITEM_LIST))
          ?.filter((element: Element) => (!!element.getElementsByClassName(SiteElementsName.CURRENCY_LIST)?.length))
          ?.forEach((element: Element) => (elements.push(element)));
        const nextPageExist: Element = html.getElementsByClassName(SiteElementsName.NEXT_BUTTON)?.item(0) as Element;

        if (nextPageExist && page < 61) {
          this.loadElements(observer, elements, page + 1, parePart as SelectValue);
        } else {
          observer.next(elements);
          observer.complete();
        }
      });
  }

  public _closeImageViewer(): void {
    this._viewerImages = [];
  }
}
