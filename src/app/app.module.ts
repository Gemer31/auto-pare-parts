import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, CurrencyPipe } from "@angular/common";
import { MatCommonModule } from "@angular/material/core";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageViewerModule } from "./components/image-viewer/image-viewer.module";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { AppFormModule } from "./components/form/app-form.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    ImageViewerModule,
    ReactiveFormsModule,


    MatCommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatBadgeModule,
    MatInputModule,
    AppFormModule,
  ],
  providers: [
    CurrencyPipe,
    MatSnackBar,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
