import { ChangeDetectorRef, Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { ParePartCalculatedModel, SelectValue, SiteElementsName, TableRow } from "./models";
import { MatSnackBar, } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';

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
  public _viewerImages: HTMLImageElement[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.getHtml(this.defaultURL)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MARKA, this._markas);
        this.collectValues(html, SiteElementsName.ZAPCHAST, this._pareParts); //1728
      });
  }

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
    const parePartModel: ParePartCalculatedModel = {
      secondHandElementsCounter: 0,
      secondHandMinPrice: 0,
      secondHandAveragePrice: 0,
      secondHandMaxPrice: 0,
      newElementsCounter: 0,
      newMinPrice: 0,
      newAveragePrice: 0,
      newMaxPrice: 0
    }

    this._tableData = [];
    this._loadingInProgress = true;

    (this._selectedParePart?.length ? this._selectedParePart : this._pareParts).forEach((parePart: SelectValue) => {
      parePart.value?.length && this.resolvePage(
        {...parePartModel, name: parePart.text as string},
        1,
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

    this.snackBar.open("Таблица сохранена", "",{
      horizontalPosition: "end",
      verticalPosition: "top",
      duration: 3000,
    });
  }

  public _openImageViewer(images: HTMLImageElement[]): void {
    this._viewerImages = images;
  }

  public testTable(): void {
    const data: TableRow[] = this._tableData;
    this._tableData = [];
    this.cdr.detectChanges();
    this._tableData = data;
  }

  private resolvePage(
    parePartModel: ParePartCalculatedModel,
    page: number,
    parePart?: SelectValue
  ): void {
    this.getHtml(this.prepareUrl(page, parePart as SelectValue))
      .then((html: Document) => {
        const elements: Element[] = Array
          .from(html.getElementsByClassName(SiteElementsName.ITEM_LIST))
          ?.filter((element: Element) => {
            return !!element.getElementsByClassName(SiteElementsName.CURRENCY_LIST)?.length;
          });
        const nextPageExist: Element = html.getElementsByClassName(SiteElementsName.NEXT_BUTTON)?.item(0) as Element;

        elements.forEach((element: Element) => {
          const value = element
            ?.getElementsByClassName(SiteElementsName.CURRENCY_LIST)
            ?.item(0)?.innerHTML
            ?.trim();
          const parePartPrice: number = Number(value?.substring(1, value.length - 1));
          const isNewParePart: boolean = !!element.getElementsByClassName(SiteElementsName.NEW)?.length;
          const images: HTMLImageElement[] = Array.from(element.getElementsByClassName("thumbnail no-margin")) as HTMLImageElement[];
          images.forEach((img) => {img.src = this.defaultURL + img.src.substring(21)});

          if (isNewParePart) {
            if (!parePartModel.newMinPrice || parePartModel.newMinPrice > parePartPrice) {
              parePartModel.newMinPriceImages = images;
              parePartModel.newMinPrice = parePartPrice
            }
            if (!parePartModel.newMaxPrice || parePartModel.newMaxPrice < parePartPrice) {
              parePartModel.newMaxPriceImages = images;
              parePartModel.newMaxPrice = parePartPrice
            }
            parePartModel.newAveragePrice = !parePartModel.newAveragePrice
              ? parePartPrice
              : parePartModel.newAveragePrice + parePartPrice;
            parePartModel.newElementsCounter += 1;
          } else {
            if (!parePartModel.secondHandMinPrice || parePartModel.secondHandMinPrice > parePartPrice) {
              parePartModel.secondHandMinPriceImages = images;
              parePartModel.secondHandMinPrice = parePartPrice
            }
            if (!parePartModel.secondHandMaxPrice || parePartModel.secondHandMaxPrice < parePartPrice) {
              parePartModel.secondHandMaxPriceImages = images;
              parePartModel.secondHandMaxPrice = parePartPrice
            }
            parePartModel.secondHandAveragePrice = !parePartModel.secondHandAveragePrice
              ? parePartPrice
              : parePartModel.secondHandAveragePrice + parePartPrice;
            parePartModel.secondHandElementsCounter += 1;
          }
        });

        if (nextPageExist && page < 61) {
          this.resolvePage({...parePartModel}, page + 1, parePart as SelectValue);
        } else {
          this._tableData.push({
            ...parePartModel,
            position: this._tableData.length + 1,
            secondHandAveragePrice: parePartModel.secondHandElementsCounter === 0
              ? 0
              : (parePartModel?.secondHandAveragePrice || 0) / parePartModel.secondHandElementsCounter,
            newAveragePrice: parePartModel.newElementsCounter === 0
              ? 0
              : (parePartModel.newAveragePrice || 0) / parePartModel.newElementsCounter,
          });

          if ((!!this._selectedParePart?.length
            ? this._selectedParePart?.length
            : this._pareParts?.length) === this._tableData?.length || page > 60) {
            this._loadingInProgress = false;
          }
          this.testTable();
        }
      });
  }

  public _closeImageViewer(): void {
    this._viewerImages = [];
  }
}
