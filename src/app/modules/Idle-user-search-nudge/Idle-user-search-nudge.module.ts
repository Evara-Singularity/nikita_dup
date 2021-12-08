import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleUserSearchNudgeComponent } from './Idle-user-search-nudge.component';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
@NgModule({
  imports: [
    CommonModule,
    BottomMenuModule
  ],
  declarations: [IdleUserSearchNudgeComponent],
  exports: [IdleUserSearchNudgeComponent]
})
export class IdleUserSearchNudgeModule { }
