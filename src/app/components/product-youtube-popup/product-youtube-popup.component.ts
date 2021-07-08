import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalModule } from '../../modules/modal/modal.module';
import { ModalService } from '../../modules/modal/modal.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';

@Component({
  selector: 'app-product-youtube-popup',
  templateUrl: './product-youtube-popup.component.html',
  styleUrls: ['./product-youtube-popup.component.scss']
})
export class ProductYoutubePopupComponent implements OnInit {

  @Input() link: string
  @Output() removed: EventEmitter<boolean> = new EventEmitter<boolean>();
  readonly ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.modalService.getYoutubeModalRemove().subscribe(res=>{
      this.removed.emit(true);
    })
  }

  showYTVideo() {
    let videoDetails = { url: this.link, params: this.ytParams };
    let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
    modalData.inputs = { videoDetails: videoDetails };
    this.modalService.show(modalData);
  }

}

@NgModule({
  declarations: [ ProductYoutubePopupComponent ],
  imports: [
    CommonModule,
    ModalModule
  ]
})
export class ProductYoutubePopup { }
