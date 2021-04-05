import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderNavComponent } from './header-nav.component';
import { RouterModule } from '@angular/router';
import { TypeAheadService } from '../../utils/services/typeAhead.service';

@NgModule({
  declarations: [HeaderNavComponent],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    HeaderNavComponent
  ],
  providers: [
    TypeAheadService
  ]
})
export class HeaderNavModule { }
