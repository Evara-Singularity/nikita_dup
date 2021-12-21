import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderNavComponent } from './header-nav.component';
import { RouterModule } from '@angular/router';
import { TypeAheadService } from '../../utils/services/typeAhead.service';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [HeaderNavComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    HeaderNavComponent
  ],
  providers: [
    TypeAheadService
  ]
})

export class HeaderNavModule { 
}
