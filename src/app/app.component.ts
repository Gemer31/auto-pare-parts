import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { CurrencyPipe } from "@angular/common";
import { SelectValue, TableRow } from "./models";

const ELEMENT_DATA: TableRow[] = [
  {
    position: 1,
    name: 'Капот',
    secondHandMinPrice: 12,
    secondHandAveragePrice: 24,
    secondHandMaxPrice: 36,
    newMinPrice: 15,
    newAveragePrice: 30,
    newMaxPrice: 45,
  },
  {
    position: 2,
    name: 'Бампер',
    secondHandMinPrice: 12,
    secondHandAveragePrice: 24,
    secondHandMaxPrice: 36,
    newMinPrice: 15,
    newAveragePrice: 30,
    newMaxPrice: 45,
  },
  {
    position: 3,
    name: 'Крыло',
    secondHandMinPrice: 12,
    secondHandAveragePrice: 24,
    secondHandMaxPrice: 36,
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  @HostBinding("class.app") public hostClass: boolean = true;

  public defaultURL: string = "https://bamper.by/"

  public _markas: SelectValue[] = [];
  public _pareParts: SelectValue[] = [];
  public _models: SelectValue[] = [];

  public _selectedMarka: SelectValue = {};
  public _selectedParePart: SelectValue = {};
  public _selectedModel: SelectValue = {};

  public _tableRows: TableRow[] = [];

  public _tableColumns: string[] = ['position', 'name', 'minPrice', 'averagePrice', 'maxPrice'];
  public _tableData: TableRow[] = ELEMENT_DATA;

  constructor(
    private currencyPipe: CurrencyPipe,
  ) {
  }

  ngOnInit() {
    this.getHtml(this.defaultURL)
      .then((html: Document) => {
        this.collectValues(html,"marka", this._markas);
        this.collectValues(html,"zapchast", this._pareParts);
      });
  }

  public collectValues(html: Document, elementId: string, array: SelectValue[]): void {
    html.getElementById(elementId)?.querySelectorAll("option").forEach((item: HTMLOptionElement) => {
      array.push({value: item.value, text: item.innerText});
    });
  }

  public _markaChanged(event: SelectValue): void {
    this._models = [];
    this._selectedModel = {};
    this._selectedMarka = event;

    this.getHtml(this.defaultURL + `zchbu/marka_${event.value}/`)
      .then((html: Document) => {
        this.collectValues(html,"model", this._models);
      });
  }

  private prepareUrl(page?: number): string {
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
    // if (page) {
    //   url += `?ACTION=REWRITED3&FORM_DATA=zapchast_blok-abs%2Fmarka_audi%2Fmodel_80&PAGEN_1=6`
    // }
    return url;
  }

  public getHtml(url: string): Promise<Document> {
    return fetch(url)
      .then((response: Response) => (response.text()))
      .then((htmlAsString: string) => {
        return new DOMParser().parseFromString(htmlAsString, "text/html");
      });
  }

  public _calculateClicked(): void {
    this._tableData = [];

    this.getHtml(this.prepareUrl())
      .then((html: Document) => {
        let secondHandMinPrice: number = 0;
        let secondHandAveragePrice: number = 0;
        let secondHandMaxPrice: number = 0;

        let newMinPrice: number = 0;
        let newAveragePrice: number = 0;
        let newMaxPrice: number = 0;

        const elements: Element[] = Array.from(html.getElementsByClassName("price-box"));
        const nextPageExist: Element = html.getElementsByClassName("modern-page-next")?.item(0) as Element;

        elements.forEach((element: Element) => {
          const value = element.getElementsByClassName("currency-list").item(0)?.innerHTML?.trim();
          const parePartPrice: number = Number(value?.substring(1, value.length - 1));

          if (!secondHandMinPrice || secondHandMinPrice > parePartPrice) {
            secondHandMinPrice = parePartPrice
          }
          if (!secondHandMaxPrice || secondHandMaxPrice < parePartPrice) {
            secondHandMaxPrice = parePartPrice
          }
          secondHandAveragePrice = !secondHandAveragePrice ? parePartPrice : secondHandAveragePrice + parePartPrice;
        });

        this._tableData.push({
          name: this._selectedParePart?.text as string,
          position: this._tableData.length + 1,
          secondHandMinPrice: secondHandMinPrice,
          secondHandAveragePrice: secondHandAveragePrice / elements?.length,
          secondHandMaxPrice: secondHandMaxPrice,
          // newMinPrice: newMinPrice,
          // newAveragePrice: newAveragePrice,
          // newMaxPrice: newMaxPrice
        })
      });

  }
}
