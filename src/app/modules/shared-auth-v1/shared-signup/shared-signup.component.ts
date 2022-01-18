import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'shared-singup',
  templateUrl: './shared-signup.component.html',
  styleUrls: ['./shared-signup.component.scss']
})
export class SharedSignupComponent implements OnInit {

  isSubmitted = false;

  signupForm = new FormGroup({
    name: new FormControl(""),
    email: new FormControl(""),
    mobile: new FormControl(""),
    password: new FormControl(""),
  })


  constructor() { }

  ngOnInit(): void {
  }

  get name() { return this.signupForm.get("name"); }
  get email() { return this.signupForm.get("email"); }
  get mobile() { return this.signupForm.get("mobile"); }
  get password() { return this.signupForm.get("password"); }


}
