import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { DataStorageService } from "../shared/data-storage.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-user-interface",
  templateUrl: "./user-interface.component.html",
  styleUrls: ["./user-interface.component.css"],
})
export class UserInterfaceComponent implements OnInit, AfterViewInit {
  @ViewChild("cancelButton", { static: false }) cancelButton: ElementRef;
  showComponents: boolean;
  userData;
  constructor(
    private authService: AuthService,
    private dataStoring: DataStorageService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.onFetch();
  }
  ngAfterViewInit() {}

  logout() {
    this.authService.SignOut();
    localStorage.removeItem("userData");
    this.userData = null;
    this.showComponents = false;
    // this.router.navigate(["/auth"]);
  }

  // Fetch data from db and store it in localStorage
  onFetch() {
    this.afAuth.user.subscribe((user) => {
      if (user) {
        setTimeout(() => {
          this.dataStoring.fetchUserData(user.uid).subscribe((data) => {
            this.dataStoring.userId = user.uid;
            this.userData = data;
            localStorage.setItem("userData", JSON.stringify(data));
            this.showComponents = true;
          });
        }, 200);
      }
    });
  }
  onSubmit(form: NgForm) {
    let name = form.value.name;
    let value = form.value.value;
    if (name == "") {
      name = this.userData.name;
    }
    if (value == 0 || value == null) {
      value = this.userData.monthlyIncome;
    }

    this.dataStoring.updateUserData(name, value);
    this.onFetch();
    form.form.patchValue({
      name: "",
      value: 0,
    });
  }
  //  when submit close the modal
  triggerEvent() {
    this.cancelButton.nativeElement.click();
  }
}
