import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ClientUtility } from "../../utils/client.utility";


@Component({
  selector: 'shared-footer',
  templateUrl: './shared-footer.component.html',
  styleUrls: ['./shared-footer.component.scss']
})
export class SharedFooterComponent {
  footerVisible = false;

  constructor() { }

  clickFooter() {
    this.footerVisible = !this.footerVisible;
    if (this.footerVisible && document.getElementById("footerContainer")) {
      let footerOffset = document.getElementById("footerContainer").offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset - 50);
    }
  }
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    SharedFooterComponent
  ],
  exports: [
    SharedFooterComponent
  ],
})
export class SharedFooterModule { }
