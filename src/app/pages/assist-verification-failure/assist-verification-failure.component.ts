import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { GLOBAL_CONSTANT } from '@app/config/global.constant';

@Component({
  selector: 'app-assist-verification-failure',
  templateUrl: './assist-verification-failure.component.html',
  styleUrls: ['./assist-verification-failure.component.scss']
})
export class AssistVerificationFailureComponent implements OnInit {

  constructor(private titleService:Title) {
    this.titleService.setTitle(GLOBAL_CONSTANT.genricTitleBarText);
  }

  ngOnInit(): void {
  }

}
