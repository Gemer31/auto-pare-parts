import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';

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

  tableColumns: string[] = ['position', 'name', 'minPrice', 'averagePrice', 'maxPrice'];
  tableData = ELEMENT_DATA;

  ngOnInit() {
    fetch(this.defaultURL)
      .then((response: Response) => (response.text()))
      .then((htmlAsString: string) => {
        const html: DocumentFragment = document.createRange().createContextualFragment(htmlAsString);

        html.getElementById("marka")?.querySelectorAll("option").forEach((item: HTMLOptionElement) => {
          this._markas.push({value: item.value, text: item.innerText});
        });

        html.getElementById("zapchast")?.querySelectorAll("option").forEach((item: HTMLOptionElement) => {
          this._pareParts.push({value: item.value, text: item.innerText});
        });
      });
  }

  public _markaChanged(event: any): void {
    fetch(this.defaultURL + `zchbu/marka_${event}/`)
      .then((response: Response) => (response.text()))
      .then((htmlAsString: string) => {
        const html: DocumentFragment = document.createRange().createContextualFragment(htmlAsString);

        html.getElementById("model")?.querySelectorAll("option").forEach((item) => {
          this._models.push({value: item.value, text: item.innerText});
        });
      });
  }

  private prepareUrl(): string {
    let url: string = this.defaultURL + "zchbu/";

    if (this._selectedParePart?.value) {
      url += `zapchast_${this._selectedParePart.value}/`;
    }
    if (this._selectedMarka?.value) {
      url += `marka_${this._selectedMarka.value}/`;
    }
    if (this._selectedModel?.value) {
      url += `model_${this._selectedMarka.value}/`;
    }

    return url;
  }

  public _calculateClicked(): void {
    fetch(this.prepareUrl())
      .then((response: Response) => (response.text()))
      .then((htmlAsString: string) => {
        const html: DocumentFragment = document.createRange().createContextualFragment(htmlAsString);

        html.getElementById("model")?.querySelectorAll("option").forEach((item) => {
          this._models.push({value: item.value, text: item.innerText});
        });
      });
  }

  class = "modern-page-next"
}
