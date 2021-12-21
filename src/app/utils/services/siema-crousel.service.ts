import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SiemaCrouselService {
  moveToSlideInProduct: Subject<number> = new Subject<number>();
  productCrouselPopupState: Subject<any> = new Subject<any>();

  getMoveProductScrouselSlide(): Observable<number> {
    return this.moveToSlideInProduct.asObservable();
  }

  setMoveProductScrouselSlide(slideNumber: number) {
    this.moveToSlideInProduct.next(slideNumber);
  }

  setProductScrouselPopup(status: any) {
    this.productCrouselPopupState.next(status);
  }

  getProductScrouselPopup(): Observable<any> {
    return this.productCrouselPopupState.asObservable();
  }
}
