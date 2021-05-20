import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'diagnostic',
  templateUrl: 'diagnostic.html',
  styleUrls: ['diagnostic.scss']
})

export class DiagnosticComponent {

  API: {};
  constructor(private title: Title, public meta: Meta) {
  }
  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Diagnostic Buying Guide by Moglix.com" });
    this.title.setTitle("Diagnostic Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Diagnostic at Moglix.com with exclusive buying guide on popular industrial products." })

  }
}