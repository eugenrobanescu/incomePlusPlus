import { Component, OnInit } from "@angular/core";

import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { formatDate } from "@angular/common";

import { NgForm, FormGroup, FormControl } from "@angular/forms";
import { DataStorageService } from "src/app/shared/data-storage.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { Subscription } from "rxjs";

@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.css"],
})
export class HistoryComponent implements OnInit {
  currentSum;
  currentDate = formatDate(new Date(), "shortTime", "en");
  currentDateForInput = this.currentDate.substr(0, this.currentDate.length - 3);
  products;
  plusMode = true;
  plusToggle;
  userDataPlus = [];
  userDataMinus = [];
  subscription: Subscription;
  public multiple = false;
  public allowUnsort = true;
  public sort: SortDescriptor[] = [
    {
      field: "ProductName",
      dir: "asc",
    },
  ];
  public gridView: GridDataResult;
  public formGroup: FormGroup;
  private editedRowIndex: number;

  constructor(
    private dataStoring: DataStorageService,
    private afAuth: AngularFireAuth
  ) {
    this.currentDateMethod();
    setInterval(() => {
      this.currentDateMethod();
    }, 30000);
    this.storingData();
    this.onPlusToggle();
  }

  ngOnInit() {
    this.dataStoring.getNewSalary().subscribe(() => {
      this.onFetchHistory();
    });
  }

  // Update the input type time at 30 sec
  currentDateMethod() {
    const currentDate = formatDate(new Date(), "hh:mm", "en");
    if (new Date().getHours() < 10) {
      this.currentDateForInput = currentDate.substr(
        0,
        this.currentDate.length - 2
      );
    } else {
      this.currentDateForInput = currentDate.substr(
        0,
        this.currentDate.length - 2
      );
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadProducts();
  }

  loadProducts(): void {
    this.gridView = {
      data: orderBy(
        this.plusMode ? this.userDataPlus : this.userDataMinus,
        this.sort
      ),
      total: this.userDataPlus.length,
    };
  }
  // stores data in arrays for kendo grid
  storingData() {
    this.products = JSON.parse(localStorage.getItem("userData"));
    this.currentSum = this.products.currentSum;
    if (this.products.hasOwnProperty("history")) {
      for (let key in this.products.history.plus) {
        this.userDataPlus.push(this.products.history.plus[`${key}`]);
      }
      for (let key in this.products.history.minus) {
        this.userDataMinus.push(this.products.history.minus[`${key}`]);
      }
    }

    this.loadProducts();
  }
  // load minus grid or plus grid and set the mode
  onSwitchMode() {
    this.plusMode = !this.plusMode;
    this.loadProducts();
    this.onPlusToggle();
  }
  onPlusToggle() {
    if (this.plusMode) {
      this.plusToggle = "plus";
    } else {
      this.plusToggle = "minus";
    }
  }

  onSubmit(form: NgForm) {
    const date = form.value.date;

    const name = form.value.name;
    const value = form.value.value;
    let currentSum;
    if (this.plusMode) {
      currentSum = this.currentSum + value;
    } else {
      currentSum = this.currentSum - value;
    }
    // key = the key to the new item
    const key = this.dataStoring.db.database.ref().child("date").push().key;
    const userDataUpdate = { date: date, name: name, value: value, key: key };
    this.dataStoring.addData(userDataUpdate, currentSum, this.plusToggle);

    this.onFetchHistory();
    form.form.patchValue({
      name: "",
      value: 0,
    });
  }
  onFetchHistory() {
    this.afAuth.user.subscribe((user) => {
      this.dataStoring.fetchUserData(user.uid).subscribe((data) => {
        localStorage.removeItem("userData");
        this.userDataPlus = [];
        this.userDataMinus = [];
        localStorage.setItem("userData", JSON.stringify(data));
        this.products = JSON.parse(localStorage.getItem("userData"));
        this.storingData();
      });
    });
  }

  //  Kendo UI methods
  public removeHandler({ dataItem }) {
    let currentSum;
    if (this.plusMode) currentSum = this.currentSum - dataItem.value;
    else currentSum = this.currentSum + dataItem.value;

    this.dataStoring.remove(dataItem, currentSum, this.plusToggle);
    this.onFetchHistory();
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);

    this.formGroup = new FormGroup({
      date: new FormControl(),
      name: new FormControl(dataItem.name),
      value: new FormControl(dataItem.value),
    });
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  public cancelHandler({ sender, rowIndex }) {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, dataItem }) {
    let date;
    if (formGroup.value.date == null) {
      date = dataItem.date;
    } else {
      date = formatDate(formGroup.value.date, "yyyy-MM-dd", "en");
    }
    const name = formGroup.value.name;
    const value = formGroup.value.value;
    const key = dataItem.key;
    const obj = { date: date, key: key, name: name, value: value };
    let currentSum;

    // Verify if it's plusMode and if value is less or greater than initial value

    if (this.plusMode) {
      if (value > dataItem.value) {
        currentSum = this.currentSum + (value - dataItem.value);
      } else {
        currentSum = this.currentSum - (dataItem.value - value);
      }
    } else {
      if (value > dataItem.value) {
        currentSum = this.currentSum - (value - dataItem.value);
      } else {
        currentSum = this.currentSum + (dataItem.value - value);
      }
    }
    this.dataStoring.editData(obj, currentSum, this.plusToggle);
    this.onFetchHistory();
    sender.closeRow(rowIndex);
  }
}
