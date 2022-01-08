import { ChangeDetectorRef, Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { ElementValues, SelectValue, SiteElementsName, TableRow } from "./models";
import { MatSnackBar, } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { Observable, Subscriber } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  @HostBinding("class.app") public hostClass: boolean = true;

  private defaultURL: string = "https://bamper.by/"

  public _markas: SelectValue[] = [];
  public _pareParts: SelectValue[] = [];
  public _models: SelectValue[] = [];
  public _selectedMarka: SelectValue = {};
  public _selectedParePart: SelectValue[] = [];
  public _selectedModel: SelectValue = {};
  public _tableData: TableRow[] = [];

  public _loadingInProgress: boolean = false;
  public _loadingModelsInProgress: boolean = false;
  public _loadingMainParamsInProgress: boolean = true;

  public _viewerImages: HTMLImageElement[] = [];

  // public _filteredMarkas: Observable<SelectValue[]> = new Observable;
  // public _filteredModels: Observable<SelectValue[]> = new Observable;
  // public _filteredPareParts: Observable<SelectValue[]> = new Observable;
  //
  // public _markasControl = new FormControl();
  // public _modelsControl = new FormControl();
  // public _parePartsControl = new FormControl();

  constructor(
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.getHtml(this.defaultURL)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MARKA, this._markas);
        this.collectValues(html, SiteElementsName.ZAPCHAST, this._pareParts); //1728
        this._loadingMainParamsInProgress = false;
      });

    // this._filteredMarkas = this._markasControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => (typeof value === 'string' ? value : value.text)),
    //   map(name => (name ? this._filter(name, this._markas) : this._markas.slice())),
    // );
    // this._filteredPareParts = this._parePartsControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => (typeof value === 'string' ? value : value.text)),
    //   map(name => (name ? this._filter(name, this._pareParts) : this._pareParts.slice())),
    // );
  }

  //
  // public _displayFn(selectedValue: SelectValue): string {
  //   return selectedValue && selectedValue.text ? selectedValue.text : '';
  // }
  //
  // private _filter(text: string, options: SelectValue[]): SelectValue[] {
  //   return options.filter(item => item?.text?.toLowerCase().includes(text.toLowerCase()));
  // }

  public getHtml(url: string): Promise<Document> {
    return fetch(url)
      .then((response: Response) => (response.text()))
      .then((htmlAsString: string) => {
        return new DOMParser().parseFromString(htmlAsString, "text/html");
      });
  }

  public _markaChanged(event: SelectValue): void {
    this._loadingModelsInProgress = true;
    this._models = [];
    this._selectedModel = {};
    this._selectedMarka = event;

    this.getHtml(this.defaultURL + `zchbu/marka_${event.value}/`)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MODEL, this._models);
        this._loadingModelsInProgress = false;
      });
  }

  public collectValues(html: Document, elementId: string, array: SelectValue[]): void {
    html.getElementById(elementId)?.querySelectorAll("option").forEach((item: HTMLOptionElement) => {
      array.push({value: item.value, text: item.innerText});
    });
  }

  private prepareUrl(page: number, parePart: SelectValue): string {
    // https://bamper.by/zchbu/zapchast_dver-zadnyaya-levaya/marka_alfaromeo/model_156/photo_Y/?ACTION=REWRITED3&FORM_DATA=zapchast_dver-zadnyaya-levaya%2Fmarka_alfaromeo%2Fmodel_156%2Fphoto_Y&PAGEN_1=2

    let url: string = this.defaultURL + "zchbu/";

    url += `zapchast_${parePart.value}/`;
    if (this._selectedMarka?.value) {
      url += `marka_${this._selectedMarka.value}/`;
    }
    if (this._selectedModel?.value) {
      url += `model_${this._selectedModel.value}/`;
    }
    url += "store_Y/?ACTION=REWRITED3&FORM_DATA=";

    url += `zapchast_${parePart.value}${this._selectedMarka?.value || this._selectedModel?.value ? "%2F" : ""}`;

    if (this._selectedMarka?.value) {
      url += `marka_${this._selectedMarka.value}${this._selectedModel?.value ? "%2F" : ""}`;
    }
    if (this._selectedModel?.value) {
      url += `model_${this._selectedModel.value}`;
    }
    url += `%2Fstore_Y&PAGEN_1=${page}`;

    return url;
  }

  public _calculateClicked(): void {
    this._tableData = [];
    this._loadingInProgress = true;

    (this._selectedParePart?.length ? this._selectedParePart : this._pareParts).forEach((parePart: SelectValue) => {
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
    /* table id is passed over here */
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, "таблица_с_ценами.xlsx");

    this.snackBar.open("Таблица сохранена", "", {
      horizontalPosition: "end",
      verticalPosition: "top",
      duration: 3000,
    });
  }

  public _openImageViewer(images: HTMLImageElement[]): void {
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

      elements?.forEach((element: Element) => {
        !!element.getElementsByClassName(SiteElementsName.NEW)?.length
          ? nemElements.push(element)
          : secondHandElements.push(element);
      })

      nemElements?.forEach((element: Element) => {
        const elementValues: ElementValues = this.getElementValues(element);

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
        const elementValues: ElementValues = this.getElementValues(element);

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

      this._tableData = [ ...this._tableData, {
        ...parePartModel,
        position: this._tableData.length + 1,
        secondHandAveragePrice: (parePartModel?.secondHandAveragePrice || 0) / secondHandElements?.length,
        newAveragePrice: (parePartModel.newAveragePrice || 0) / nemElements?.length,
      }];

      if ((!!this._selectedParePart?.length
        ? this._selectedParePart?.length
        : this._pareParts?.length) === this._tableData?.length) {
        this._loadingInProgress = false;
      }
    });
  }

  private getElementValues(element: Element): ElementValues {
    const value = element
      ?.getElementsByClassName(SiteElementsName.CURRENCY_LIST)
      ?.item(0)?.innerHTML
      ?.trim();
    const images: HTMLImageElement[] = Array.from(element.getElementsByClassName("thumbnail no-margin")) as HTMLImageElement[];
    images?.forEach((img: HTMLImageElement) => { img.src = this.defaultURL + img.src.substring(21) })

    return {
      parePartPrice: Number(value?.substring(1, value.length - 1)),
      images
    }
  }

  private loadElements(
    observer: Subscriber<Element[]>,
    elements: Element[],
    page: number,
    parePart?: SelectValue
  ): void {
    this.getHtml(this.prepareUrl(page, parePart as SelectValue))
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
