import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-product-share',
  templateUrl: './product-share.component.html',
  styleUrls: ['./product-share.component.scss']
})
export class ProductShareComponent implements OnInit {

  @Input() productResult: any = {};
  @Input() show: boolean = true;
  @Input() shareFbUrl: string = '';
  @Input() shareTwitterUrl: string = '';
  @Input() shareLinkedInUrl: string = '';
  @Input() shareWhatsappUrl: string = '';
  @Output() removed: EventEmitter<boolean> = new EventEmitter<boolean>();
  public API = CONSTANTS;

  ngOnInit(): void {
    console.log(this.shareFbUrl);
  }

  hide() {
    this.show = false;
    this.removed.emit(true);
  }

  share() {
  }

}

@NgModule({
  declarations: [
    ProductShareComponent,
  ],
  imports: [CommonModule, BottomMenuModule],
})
export class ProductShareModule { }
