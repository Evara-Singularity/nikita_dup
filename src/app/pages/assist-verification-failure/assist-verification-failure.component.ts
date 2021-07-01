import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-assist-verification-failure',
  templateUrl: './assist-verification-failure.component.html',
  styleUrls: ['./assist-verification-failure.component.scss']
})
export class AssistVerificationFailureComponent implements OnInit {

  constructor(private titleService:Title) {
    this.titleService.setTitle("Shop online for Industrial & Home Products: Tools, Electricals, Safety Equipment & more. - Moglix.com");
  }

  ngOnInit(): void {
  }

}
