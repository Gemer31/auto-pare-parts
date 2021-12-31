import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from "@angular/common";
import { MatCommonModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { HttpClientModule } from "@angular/common/http";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    MatCommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatTableModule,
    HttpClientModule,
    MatButtonModule,
    NgModule
  ],
  providers: [
    XMLHttpRequest,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
