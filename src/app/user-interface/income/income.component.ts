import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { DataStorageService } from "src/app/shared/data-storage.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { formatDate } from "@angular/common";
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";
import { HistoryComponent } from "../history/history.component";
@Component({
  selector: "app-income",
  templateUrl: "./income.component.html",
  styleUrls: ["./income.component.css"],
  providers: [LoadingSpinnerComponent, HistoryComponent],
})
export class IncomeComponent {
  sumsHistory; // save sumsHistory as object
  sumsArray: any[] = []; // save sumsHistory as array for chart
  userData;
  activateMode;
  currentDate = new Date();
  single: any[];
  multi: any[];
  view: any[] = [800, 500];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = "Date";
  showYAxisLabel = true;
  yAxisLabel = "Cash flow";
  schemeType = "linear";

  colorScheme = {
    domain: ["#5AA454", "#E44D25", "#CFC0BB", "#7aa3e5", "#a8385d", "#aae3f5"],
  };

  constructor(
    private dataStoring: DataStorageService,
    private afAuth: AngularFireAuth
  ) {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.sumsHistory = this.userData.sumsHistory;

    this.activateMode = this.userData.autoIncrement.verify;
    setInterval(() => {
      this.currentDate = new Date();

      if (this.activateMode) {
        this.createCurrentSumHistory();
        this.autoIncrement(this.userData.autoIncrement.date);
      }
    }, 500);

    this.convertData();
  }

  onSelect(event) {
    console.log(event);
  }

  // transform object data in array for chart
  convertData() {
    this.sumsArray = [];
    for (let key in this.sumsHistory) {
      this.sumsArray.push(this.sumsHistory[key]);
    }
    Object.assign(this.sumsArray);
  }

  onSubmit(form: NgForm) {
    const payDay = form.value.value;
    let toggle; // set in db if activate mode is true or false
    if (this.activateMode == false) {
      this.activateMode = !this.activateMode;
      toggle = true;
      this.dataStoring.changeAutoIncrement(toggle);
      this.dataStoring.addDateAutoIncremet(payDay);
      this.autoIncrement(payDay);
    } else {
      this.activateMode = !this.activateMode;
      toggle = false;
      this.dataStoring.changeAutoIncrement(toggle);
    }

    this.onFetch();
  }

  // Add new salary in income "plus" automatically to the set date
  autoIncrement(payday) {
    this.onFetch();

    const currentSum = this.userData.currentSum + this.userData.monthlyIncome;
    let permission;
    // if userData has property "history" check if salary has been added
    // else permission == true
    if (
      this.userData.hasOwnProperty("history") &&
      this.userData.history.hasOwnProperty("plus")
    ) {
      const result = this.userData.history.plus;
      for (let property in result) {
        if (
          result[property].name == "Salary" &&
          result[property].date == formatDate(new Date(), "mm:ss", "en")
        ) {
          permission = false;
          break;
        } else {
          permission = true;
        }
      }
    } else {
      permission = true;
    }

    if (this.currentDate.getSeconds() == payday && permission) {
      this.dataStoring.addSalary(
        this.userData.monthlyIncome,
        formatDate(new Date(), "mm:ss", "en"),
        currentSum
      );
      this.dataStoring.emitNewSalary();
    } else {
    }
  }

  // create a money history at the end of month
  createCurrentSumHistory() {
    let storingSumDate = this.userData.autoIncrement.date + 20;
    const currentSum = this.userData.currentSum;
    let permission;
    if (storingSumDate > 60) {
      storingSumDate = this.userData.autoIncrement.date + 20 - 60;
    }
    if (this.userData.hasOwnProperty("sumsHistory")) {
      for (let property in this.userData.sumsHistory) {
        if (
          this.userData.sumsHistory[property].name ==
          formatDate(new Date(), "mm:ss", "en")
        ) {
          permission = false;
        } else {
          permission = true;
        }
      }
    } else {
      permission = true;
    }

    if (this.currentDate.getSeconds() == storingSumDate && permission) {
      this.dataStoring.addEndOfTheMonth(
        formatDate(new Date(), "mm:ss", "en"),
        currentSum
      );

      this.sumsArray = [];
      this.onFetch();
    } else {
    }
  }

  onFetch() {
    this.afAuth.user.subscribe((user) => {
      this.dataStoring.fetchUserData(user.uid).subscribe((data) => {
        localStorage.removeItem("userData");
        localStorage.setItem("userData", JSON.stringify(data));
        this.userData = JSON.parse(localStorage.getItem("userData"));
        this.sumsHistory = this.userData.sumsHistory;
        this.activateMode = this.userData.autoIncrement.verify;
        this.convertData();
      });
    });
  }
}
