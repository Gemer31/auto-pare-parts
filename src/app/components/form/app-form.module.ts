import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppFormComponent } from './app-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, CurrencyPipe } from "@angular/common";
import { MatCommonModule, MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  declarations: [
    AppFormComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,

    MatIconModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatSelectModule,
  ],
  exports: [
    AppFormComponent
  ],
  bootstrap: [
    AppFormComponent
  ]
})
export class AppFormModule {
}
