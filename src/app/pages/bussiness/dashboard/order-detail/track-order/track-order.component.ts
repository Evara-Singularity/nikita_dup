import { Subject } from "rxjs/Subject";
import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";

@Component({
  selector: "track-order",
  templateUrl: "./track-order.component.html",
  styleUrls: ["./track-order.component.scss"],
})
export class TrackOrderComponent implements OnInit {
  constructor() {}
  private cDistryoyed = new Subject();
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @Input() itemDetails;
  groupByDate = null;
  displayScans = false;
  shipmentDetail = null;
  shippedDates = [];
  readonly statusKeys = {
    shipped: "Shipped",
    confirmed: "Processed",
    accepted: "Accepted",
  };
  readonly trackingMessage =
    "Tracking information from courier partner is not available at the moment.";
  deliveredInfo = null;

  ngOnInit() {
    this.displayScans = this.itemDetails["hasInfo"];
    if (this.displayScans) {
      this.groupByDate = this.itemDetails["groupByDate"];
      this.buildShippedDates(this.itemDetails["dates"]);
      this.shipmentDetail = this.itemDetails["shipment_detail"];
    }
    this.deliveredInfo = this.itemDetails["dates"]["delivered"];
    console.log(this.itemDetails["lastOutForDelivery"]);
  }

  buildShippedDates(dates) {
    Object.keys(this.statusKeys).forEach((val) => {
      dates[val]["status"] = this.statusKeys[val];
      this.shippedDates.push(dates[val]);
    });
    this.shippedDates.splice(1, 0, {
      status: "Packed",
      date: null,
      flag: true,
    });
  }

  closeModal() {
    this.closePopup$.emit();
  }

  ngOnDestroy() {
    this.cDistryoyed.next();
    this.cDistryoyed.unsubscribe();
  }

  checkOutForDsiplay(date) {
    if (
      this.itemDetails["lastOutForDelivery"] &&
      this.itemDetails["lastOutForDelivery"] == date
    ) {
      return false;
    }
    return true;
  }
}