import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth.service";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { DataStorageService } from "../shared/data-storage.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.css"],
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(private router: Router, private authService: AuthService) {}
  email: string;
  password: string;
  ngOnInit() {
    this.authService.autoLogin();
  }
  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const name = form.value.fullName;
    const mIncome = form.value.monthlyIncome;
    const email = form.value.email;
    const password = form.value.password;

    if (this.isLoginMode) {
      this.authService.SignIn(email, password).catch((error) => {
        console.log(error);
        this.handleError(error);
      });

      this.router.navigate(["./user-interface"]);

      this.email = "";
      this.password = "";
    } else {
      this.authService.SignUp(email, password, name, mIncome).catch((error) => {
        this.handleError(error);
      });

      this.router.navigate(["./user-interface"]);
      this.email = "";
      this.password = "";
    }
    form.reset();
  }
  private handleError(errorRes: any) {
    let errorMessage = "An unknown error occurred!";
    if (!errorRes) {
      this.error = errorMessage;
    }
    switch (errorRes.code) {
      case "auth/invalid-email":
        errorMessage = "The email address is badly formatted.";
        break;
      case "auth/argument-error":
        errorMessage = "The email address is badly formatted.";
        break;
      case "auth/wrong-password":
        errorMessage = "This password is not correct.";
        break;
      case "auth/user-not-found":
        errorMessage = "The user does not exist";
        break;
      case "INVALID_PASSWORD":
        errorMessage = "This password is not correct.";
        break;
      case "INVALID_PASSWORD":
        errorMessage = "This password is not correct.";
        break;
    }

    this.error = errorMessage;
  }
}
