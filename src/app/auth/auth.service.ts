import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Subject, BehaviorSubject } from "rxjs";
import { DataStorageService } from "../shared/data-storage.service";
@Injectable({
  providedIn: "root",
})
export class AuthService {
  userData = new BehaviorSubject(null);

  error: string;

  constructor(
    private afAuth: AngularFireAuth, // Inject Firebase auth service
    private router: Router,
    private dataStore: DataStorageService
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData.next(user);
        this.userData.subscribe((res) => {
          return res;
        });

        localStorage.setItem("user", JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem("user"));
      } else {
        localStorage.setItem("user", null);
        JSON.parse(localStorage.getItem("user"));
      }
    });
  }

  // Sign up with email/password
  SignUp(email, password, name, mIncome) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        let id;
        id = result.user.uid;
        this.dataStore.postUser(id, name, mIncome);
        this.userData.next(result.user.uid);
        // this.dataStore.userId = id;
        localStorage.setItem("user", JSON.stringify(this.userData));
        this.router.navigate(["./user-interface"]);
      });
  }

  // Sign in with email/password
  SignIn(email, password) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        console.log(result);
        this.userData.next(result);
        localStorage.setItem("user", JSON.stringify(this.userData));
        this.router.navigate(["./user-interface"]);
      });
  }

  SignOut() {
    this.userData.next(null);
    this.afAuth.signOut().then(() => {});
    localStorage.removeItem("user");
    this.router.navigate(["/auth"]);
  }

  autoLogin() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(["/user-interface"]);
      }
    });
  }
}
