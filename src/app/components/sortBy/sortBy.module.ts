import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortByComponent } from './sortBy.component';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@NgModule({
  imports: [CommonModule,BottomMenuModule],
  exports: [SortByComponent],
  declarations: [SortByComponent],
})

export class SortByModule {}