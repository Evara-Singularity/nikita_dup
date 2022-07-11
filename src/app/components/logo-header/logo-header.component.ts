import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'logo-header',
  templateUrl: './logo-header.component.html',
  styleUrls: ['./logo-header.component.scss']
})
export class LogoHeaderComponent implements OnInit {

  @Input() imgAssetPath:string = "";

  
  constructor() { }

  ngOnInit(): void {
  }

}


@NgModule({
  declarations: [LogoHeaderComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [LogoHeaderComponent]
})
export class LogoHeaderModule
{
}
