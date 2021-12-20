import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderNavComponent } from './header-nav.component';
import { RouterModule } from '@angular/router';
import { TypeAheadService } from '../../utils/services/typeAhead.service';
import { ReactiveFormsModule } from '@angular/forms';
// import { LottieModule } from 'ngx-lottie';
// import player from 'lottie-web';

// export function playerFactory() {
//   return player;
// }
@NgModule({
  declarations: [HeaderNavComponent],
  imports: [
    // LottieModule.forRoot({ player: playerFactory }),
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
