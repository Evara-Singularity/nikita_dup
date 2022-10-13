import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BottomMenuModule } from '../../modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'rbi-guidelines-bottom-sheet',
  templateUrl: './rbi-guidelines-bottom-sheet.component.html',
  styleUrls: ['./rbi-guidelines-bottom-sheet.component.scss']
})
export class RbiGuidelinesBottomSheetComponent implements OnInit {
  @Input() bm: boolean = true;
  
  constructor( ) { }

  ngOnInit(): void { }

  resetBottomOpt() {
    this.bm = false;
    (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
    this.enableScroll();
  }

  preventDefault(e) {
    e.preventDefault();
  }
  enableScroll() {
      document.body.removeEventListener('touchmove', this.preventDefault);
  }

  onUpdate(data) {
    if (data.popupClose) {
      this.resetBottomOpt()
    }
  }
}

@NgModule({
  imports: [
    CommonModule,
    BottomMenuModule,
    RouterModule
  ],
  declarations: [
    RbiGuidelinesBottomSheetComponent
  ]
})
export class NavBottomSheetModule { }