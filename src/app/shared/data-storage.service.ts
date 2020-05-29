import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AngularFireDatabase } from "@angular/fire/database";
import { AuthService } from "../auth/auth.service";
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
  providedIn: "root",
})
export class DataStorageService {
  eventEmitter: EventEmitter<any> = new EventEmitter();
  userId;
  constructor(
    private http: HttpClient,
    public db: AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) {}

  // Emit an event in history.component when income.component set a new salary
  emitNewSalary() {
    this.eventEmitter.emit();
  }
  getNewSalary() {
    return this.eventEmitter;
  }

  setUserId() {
    this.afAuth.user.subscribe((user) => {
      if (user) {
        console.log(user);

        this.userId = user.uid;
      }
    });
  }

  //Post user name and monthly income first time,when sign up
  postUser(id: string, name: string, monthlyIncome: number) {
    const currentSum = 0;
    this.db.database.ref(`UserId/${id}`).set({
      name: name,
      monthlyIncome: monthlyIncome,
      currentSum: currentSum,
      autoIncrement: { verify: false, date: 15 },
    });
  }

  changeAutoIncrement(verify: boolean) {
    this.db.database
      .ref(`UserId/${this.userId}/autoIncrement/verify`)
      .set(verify);
  }

  addDateAutoIncremet(value: number) {
    this.db.database.ref(`UserId/${this.userId}/autoIncrement/date`).set(value);
  }

  // When auto increment is active
  addSalary(value, payDay, currentSum) {
    const key = this.db.database.ref().child("date").push().key;
    const userSalary = { date: payDay, name: "Salary", value: value, key: key };

    this.db.object(`UserId/${this.userId}/currentSum`).set(currentSum);
    this.db.database
      .ref(`UserId/${this.userId}/history/plus/${userSalary.key}`)
      .set(userSalary);
  }

  addEndOfTheMonth(date?, value?) {
    this.db.database
      .ref(`UserId/${this.userId}/sumsHistory`)
      .push({ name: date, value: value });
  }

  // Fetch user Data // return an object
  fetchUserData(id: string) {
    return this.db.object(`UserId/${id}`).valueChanges();
  }

  // Add new history data for a user
  addData(data, currentSum, plusToggle: string) {
    this.db.database
      .ref(`UserId/${this.userId}/history/${plusToggle}/${data.key}`)
      .set(data);
    this.db.object(`UserId/${this.userId}/currentSum`).set(currentSum);
  }

  // Remove a history data from kendo ui grid
  remove(data: any, currentSum, plusToggle: string) {
    this.db.database
      .ref(`UserId/${this.userId}/history/${plusToggle}/${data.key}`)
      .remove();
    this.db.object(`UserId/${this.userId}/currentSum`).set(currentSum);
  }

  // Edit data from kendo ui grid
  editData(data, currentSum, plusToggle: string) {
    let newPostKey = data.key;

    this.db.database
      .ref(`UserId/${this.userId}/history/${plusToggle}/${newPostKey}`)
      .set(data);
    this.db.object(`UserId/${this.userId}/currentSum`).set(currentSum);
  }

  // update name/monthly Income
  updateUserData(name: string, value: number) {
    this.db.database.ref(`UserId/${this.userId}/name`).set(name);
    this.db.database.ref(`UserId/${this.userId}/monthlyIncome`).set(value);
  }
}
