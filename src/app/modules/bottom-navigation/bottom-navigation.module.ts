import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigationComponent } from './bottom-navigation.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [BottomNavigationComponent],
  exports:[BottomNavigationComponent]
})
export class BottomNavigationModule { }
