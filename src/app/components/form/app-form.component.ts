import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AppForm, SelectValue, SiteElementsName } from "../../models";
import { AppComponent } from "../../app.component";

enum FormField {
  MARKA = "marka",
  MODEL = "model",
  PARE_PART = "parePart",
  YEAR_FROM = "yearFrom",
  YEAR_TO = "yearTo",
  FUEL = "fuel",
  ENGINE = "engine",
  GEAR = "gear",
  BODY = "body"
}

@Component({
  selector: 'app-form',
  templateUrl: './app-form.component.html',
  styleUrls: ['./app-form.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class AppFormComponent implements OnInit {

  public FORM_FIELDS = FormField;

  public _markas: SelectValue[] = [];
  public _pareParts: SelectValue[] = [];
  public _models: SelectValue[] = [];
  public _years: SelectValue[] = [];
  public _fuels: SelectValue[] = [];
  public _gears: SelectValue[] = [];
  public _bodies: SelectValue[] = [];

  public _loadingModelsInProgress: boolean = false;
  public _loadingMainParamsInProgress: boolean = true;

  @Input() public appForm: AppForm = {};

  @Output() public appFormChange: EventEmitter<AppForm> = new EventEmitter<AppForm>();
  @Output() public parePartsChange: EventEmitter<SelectValue[]> = new EventEmitter<SelectValue[]>();
  @Output() public calculateClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() public exportClick: EventEmitter<void> = new EventEmitter<void>();

  // public _filteredMarkas: Observable<SelectValue[]> = new Observable;
  // public _filteredModels: Observable<SelectValue[]> = new Observable;
  // public _filteredPareParts: Observable<SelectValue[]> = new Observable;
  //
  // public _markasControl = new FormControl();
  // public _modelsControl = new FormControl();
  // public _parePartsControl = new FormControl();

  ngOnInit() {
    AppComponent.getHtml(AppComponent.defaultURL)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MARKA, this._markas);
        this.collectValues(html, SiteElementsName.ZAPCHAST, this._pareParts); //1728
        this.collectValues(html, SiteElementsName.YEAR, this._years);
        this.collectValues(html, SiteElementsName.FUEL, this._fuels);
        this.collectValues(html, SiteElementsName.BODY, this._bodies);
        this.collectValues(html, SiteElementsName.GEAR, this._gears);

        this.sortPareParts();

        this.parePartsChange.emit(this._pareParts);
        this.appForm = {
          ...this.appForm,
          yearFrom: this._years[0],
          yearTo: this._years[this._years?.length - 1],
        };

        this._loadingMainParamsInProgress = false;
      });
  }

  private sortPareParts(): void {
    console.log(this._pareParts.length);
    this._pareParts = this._pareParts?.filter((item) => {
      const searchText: string = item.text?.toLowerCase() as string;
      return !searchText?.includes("болт")
        && !searchText?.includes("гайка")
        && !searchText?.includes("комплект")
        && !searchText?.includes("ящик")
        && !searchText?.includes("щетки")
        && !searchText?.includes("часы")
        && !searchText?.includes("ноускат")
        && !searchText?.includes("платформа")
        && !searchText?.includes("подшипник")
        && !searchText?.includes("поручень")
        && !searchText?.includes("прочая запчасть")
        && !searchText?.includes("прочие")
        && !searchText?.includes("домкрат")
        && !searchText?.includes("клемма")
        && !searchText?.includes("клеммник")
        && !searchText?.includes("клипса")
        && !searchText?.includes("балонный")
        && !searchText?.includes("прокладка")
    })
    console.log(this._pareParts.length);
  }

  //
  // public _displayFn(selectedValue: SelectValue): string {
  //   return selectedValue && selectedValue.text ? selectedValue.text : '';
  // }
  //
  // private _filter(text: string, options: SelectValue[]): SelectValue[] {
  //   return options.filter(item => item?.text?.toLowerCase().includes(text.toLowerCase()));
  // }


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

  private collectValues(html: Document, elementId: string, array: SelectValue[]): void {
    html.getElementById(elementId)?.querySelectorAll("option").forEach((item: HTMLOptionElement) => {
      array.push({value: item.value, text: item.innerText});
    });
  }

  private markaChanged(event: SelectValue): void {
    this._loadingModelsInProgress = true;
    this._models = [];
    this.appForm = {
      ...this.appForm,
      model: {},
      marka: {},
    }

    AppComponent.getHtml(AppComponent.defaultURL + `zchbu/marka_${event.value}/`)
      .then((html: Document) => {
        this.collectValues(html, SiteElementsName.MODEL, this._models);
        this._loadingModelsInProgress = false;
      });
  }

  public _formChanged(event: unknown, field: FormField): void {
    field === FormField.MARKA && this.markaChanged(event as SelectValue);
    this.appForm = {
      parePart: field === FormField.PARE_PART ? event as SelectValue[] : this.appForm.parePart,
      marka: field === FormField.MARKA ? event as SelectValue : this.appForm.marka,
      model: field === FormField.MODEL ? event as SelectValue : this.appForm.model,
      yearFrom: field === FormField.YEAR_FROM ? event as SelectValue : this.appForm.yearFrom,
      yearTo: field === FormField.YEAR_TO ? event as SelectValue : this.appForm.yearTo,
      body: field === FormField.BODY ? event as SelectValue : this.appForm.body,
      engine: field === FormField.ENGINE ? event as SelectValue : this.appForm.engine,
      fuel: field === FormField.FUEL ? event as SelectValue : this.appForm.fuel,
      gear: field === FormField.GEAR ? event as SelectValue : this.appForm.gear,
    };
    this.appFormChange.emit(this.appForm);
  }
}
