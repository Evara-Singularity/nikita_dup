import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoldMembershipComponent } from './goldMembership.component';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';


@NgModule({
  imports: [
    CommonModule,
    BottomMenuModule
  ],
  declarations: [GoldMembershipComponent],
  exports:[GoldMembershipComponent]
})
export class GoldMembershipModule { }
