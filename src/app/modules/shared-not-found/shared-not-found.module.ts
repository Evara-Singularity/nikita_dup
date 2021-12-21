import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedNotFoundComponent } from './shared-not-found.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SharedNotFoundComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    SharedNotFoundComponent
  ]
})
export class SharedNotFoundModule { }
