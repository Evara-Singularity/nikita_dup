import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "confirmationForm",
  templateUrl: "./confirmationForm.component.html",
  styleUrls: ["./confirmationForm.component.scss"],
})
export class ConfirmationFormComponent implements OnInit {
  @Output() moveToNext$: EventEmitter<any> = new EventEmitter<any>();
  @Input("bulkrfqForm") bulkrfqForm: String;
  @Input("gstinForm") gstinForm: String;
  readonly stepNameLogin = "CLOSE";
  isSimilarDataLoaded: boolean = true; 

  constructor() {}

  ngOnInit(): void {
  }

  moveToNext(stepName) {
    this.moveToNext$.emit(stepName);
  }

  similarDataLoaded(isLoaded){
    this.isSimilarDataLoaded = isLoaded;
  }
}
