import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import CONSTANTS from '../../config/constants';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';

@Component({
  selector: 'global-loader',
  templateUrl: './global-loader.component.html',
  styleUrls: ['./global-loader.component.scss']
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {

  showLoader: boolean = false
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  private loaderUnsubcribe = null;
  constructor(
    private globalLoaderService: GlobalLoaderService
  ) { }

  ngOnInit(): void {
    this.loaderUnsubcribe = this.globalLoaderService.getLoaderState().subscribe(status => {
      this.showLoader = status;
    })
  }

  ngOnDestroy() {
    this.loaderUnsubcribe.unsubscribe();
  }

}
