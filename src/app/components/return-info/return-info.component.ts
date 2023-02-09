import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-return-info',
  templateUrl: './return-info.component.html',
  styleUrls: ['./return-info.component.scss']
})
export class ReturnInfoComponent implements OnInit {

  @Input() show: boolean = true;
  @Output() removed: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    // console.log(this.shareFbUrl);
  }

  hide() {
    this.show = false;
    this.removed.emit(true);
  }

}

@NgModule({
  declarations: [
    ReturnInfoComponent,
  ],
  imports: [CommonModule, BottomMenuModule],
})
export class ReturnInfoModule { }
