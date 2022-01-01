import { ChangeDetectorRef, Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { SelectValue, SiteElementsName, TableRow } from "./models";

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
  public _selectedParePart: SelectValue = {};
  public _selectedModel: SelectValue = {};

  public _tableRows: TableRow[] = [];
  public _tableColumns: string[] = ['position', 'name', 'minPrice', 'averagePrice', 'maxPrice'];
  public _tableData: TableRow[] = [];

  public _loadingInProgress: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.getHtml(this.defaultURL)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MARKA, this._markas);
        this.collectValues(html, SiteElementsName.ZAPCHAST, this._pareParts);
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
    this._models = [];
    this._selectedModel = {};
    this._selectedMarka = event;

    this.getHtml(this.defaultURL + `zchbu/marka_${event.value}/`)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MODEL, this._models);
      });
  }

  public collectValues(html: Document, elementId: string, array: SelectValue[]): void {
    html.getElementById(elementId)?.querySelectorAll("option").forEach((item: HTMLOptionElement) => {
      array.push({value: item.value, text: item.innerText});
    });
  }

  private prepareUrl(page: number): string {
    let url: string = this.defaultURL + "zchbu/";

    if (this._selectedParePart?.value) {
      url += `zapchast_${this._selectedParePart.value}/`;
    }
    if (this._selectedMarka?.value) {
      url += `marka_${this._selectedMarka.value}/`;
    }
    if (this._selectedModel?.value) {
      url += `model_${this._selectedModel.value}/`;
    }
    url += "?ACTION=REWRITED3&FORM_DATA=";
    if (this._selectedParePart?.value) {
      url += `zapchast_${this._selectedParePart.value}${this._selectedMarka?.value || this._selectedModel?.value ? "%2F" : ""}`;
    }
    if (this._selectedMarka?.value) {
      url += `marka_${this._selectedMarka.value}${this._selectedModel?.value ? "%2F" : ""}`;
    }
    if (this._selectedModel?.value) {
      url += `model_${this._selectedModel.value}`;
    }
    url += `&PAGEN_1=${page}`;

    return url;
  }

  public _calculateClicked(): void {
    const parePartModel: TableRow = {
      name: this._selectedParePart.text as string,
      secondHandMinPrice: 0,
      secondHandAveragePrice: 0,
      secondHandMaxPrice: 0,
      newMinPrice: 0,
      newAveragePrice: 0,
      newMaxPrice: 0
    }

    this._tableData = [];
    this._loadingInProgress = true


    if (this._selectedParePart?.value) {
      this.resolvePage(parePartModel, 1);
    } else {
      this._pareParts.forEach((parePart: SelectValue) => {
        this.resolvePage({...parePartModel, name: parePart.text as string}, 1);
      })
    }
  }

  public testTable(): void {
    const data: TableRow[] = this._tableData;
    this._tableData = [];
    this.cdr.detectChanges();
    this._tableData = data;
  }

  private resolvePage(parePartModel: TableRow, page: number): void {
    this.getHtml(this.prepareUrl(page))
      .then((html: Document) => {
        const elements: Element[] = Array.from(html.getElementsByClassName(SiteElementsName.ITEM_LIST));
        const nextPageExist: Element = html.getElementsByClassName(SiteElementsName.NEXT_BUTTON)?.item(0) as Element;

        elements.forEach((element: Element) => {
          const value = element
            .getElementsByClassName(SiteElementsName.PRICE_BOX)
            ?.item(0)
            ?.getElementsByClassName(SiteElementsName.CURRENCY_LIST)
            ?.item(0)?.innerHTML
            ?.trim();
          const parePartPrice: number = Number(value?.substring(1, value.length - 1));
          const isNewParePart: boolean = !!element.getElementsByClassName(SiteElementsName.NEW)?.length;

          if (isNewParePart) {
            if (!parePartModel.newMinPrice || parePartModel.newMinPrice > parePartPrice) {
              parePartModel.newMinPrice = parePartPrice
            }
            if (!parePartModel.newMaxPrice || parePartModel.newMaxPrice < parePartPrice) {
              parePartModel.newMaxPrice = parePartPrice
            }
            parePartModel.newAveragePrice = !parePartModel.newAveragePrice
              ? parePartPrice
              : parePartModel.newAveragePrice + parePartPrice;
          } else {
            if (!parePartModel.secondHandMinPrice || parePartModel.secondHandMinPrice > parePartPrice) {
              parePartModel.secondHandMinPrice = parePartPrice
            }
            if (!parePartModel.secondHandMaxPrice || parePartModel.secondHandMaxPrice < parePartPrice) {
              parePartModel.secondHandMaxPrice = parePartPrice
            }
            parePartModel.secondHandAveragePrice = !parePartModel.secondHandAveragePrice
              ? parePartPrice
              : parePartModel.secondHandAveragePrice + parePartPrice;
          }
        });

        if (parePartModel.secondHandAveragePrice) {
          parePartModel.secondHandAveragePrice = parePartModel.secondHandAveragePrice / elements.length;
        }
        if (parePartModel.newAveragePrice) {
          parePartModel.secondHandAveragePrice = parePartModel.newAveragePrice / elements.length;
        }

        if (nextPageExist) {
          this.resolvePage(parePartModel, page + 1);
        } else {
          this._tableData.push({
            ...parePartModel,
            position: this._tableData.length + 1,
            secondHandAveragePrice: parePartModel.secondHandAveragePrice ? parePartModel.secondHandAveragePrice / page : 0,
          });

          if (this._selectedParePart?.value) {
            this._loadingInProgress = false;
            this.testTable();
          } else {
            if (this._pareParts?.length === this._tableData?.length) {
              this._loadingInProgress = false;
              this.testTable();
            }
          }
        }
      });
  }
}
