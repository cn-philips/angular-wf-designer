import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      userName: [null],
      userEmail: [null],
    });
  }
  public _roles = null;

  objectKeys = Object.keys;
  profileForm: FormGroup;
  profiles: any = {};
  ngOnInit() {
    setTimeout(() => {
      this.initUserProfile();
      this._roles = this.getRoles();
    }, 500);
    // if (window.addEventListener) {
    //   console.log("init changed detector");
    //   window.addEventListener("storage", () => this.initUserProfile(), false);
    // }
  }
  get roles() {
    if (!this._roles) {
      this._roles = this.getRoles();
    }
    return this._roles;
  }
  getRoles() {
    let roleMap = {};
    if (this.profiles && this.profiles.length > 0) {
      this.profiles.map(
        ({
          team,
          serveTeam,
          modality,
          cycleGroup,
          bigArea,
          smallArea,
          role,
        }) => {
          if (!roleMap[role]) {
            roleMap[role] = [];
          }
          let label = [
            team,
            serveTeam,
            modality,
            cycleGroup,
            bigArea,
            smallArea,
          ]
            .filter((str) => str && str.trim())
            .join("-");
          roleMap[role].push({
            label,
            serveTeam,
            team,
            modality,
            cycleGroup,
            bigArea,
            smallArea,
            role,
          });
          roleMap[role] = roleMap[role].filter(
            (i, index) =>
              roleMap[role].findIndex((item) => item.label === i.label) ===
              index
          );
        }
      );
    }
    return roleMap;
  }
  initUserProfile() {
    this.profileForm.disable({ onlySelf: true });
    let profileStr = localStorage.getItem("profiles");
    let profiles = JSON.parse(profileStr);
    this.profiles = profiles;
    if (this.profiles && this.profiles.length > 0) {
      let [profile] = this.profiles;
      this.profileForm.setValue({
        userName: profile.name,
        userEmail: profile.email,
      });
    }
  }
}
