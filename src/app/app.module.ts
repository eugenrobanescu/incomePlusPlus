import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthComponent } from "./auth/auth.component";
import { UserInterfaceComponent } from "./user-interface/user-interface.component";
import { IncomeComponent } from "./user-interface/income/income.component";
import { HistoryComponent } from "./user-interface/history/history.component";

import { LoadingSpinnerComponent } from "./shared/loading-spinner/loading-spinner.component";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { UpdateDataComponent } from "./user-interface/update-data/update-data.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { GridModule } from "@progress/kendo-angular-grid";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    UserInterfaceComponent,
    IncomeComponent,
    HistoryComponent,

    LoadingSpinnerComponent,
    UpdateDataComponent,
  ],
  imports: [
    BrowserModule,
    NgxChartsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    GridModule,
    BrowserAnimationsModule, // storage
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
