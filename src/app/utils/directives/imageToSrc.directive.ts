import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[appImageToSrc]",
})
export class ImageToSrcDirective {
  private nativeElement;
  @Input() itemImage: any;
  constructor(element: ElementRef) {
    this.nativeElement = element.nativeElement;
  }

  ngOnInit() {
    if (this.itemImage === undefined) {
      return;
    }
    const that = this;
    let reader = new FileReader();
    reader.onload = function () {
      let dataURL = reader.result;
      that.nativeElement.src = dataURL;
    };
    reader.readAsDataURL(this.itemImage);
  }
}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule],
  exports: [ImageToSrcDirective],
  declarations: [ImageToSrcDirective],
  providers: [],
})
export class ImageToSrcDirectiveModule {}
