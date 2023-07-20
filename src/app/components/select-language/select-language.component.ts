import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
} from "@angular/core";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CommonService } from "@app/utils/services/common.service";

@Component({
  selector: "select-language",
  templateUrl: "./select-language.component.html",
  styleUrls: ["./select-language.component.scss"],
})
export class SelectLanguageComponent implements OnInit {
  @Input("isHindiUrl") isHindiUrl: boolean = false;
  @Input("imagePathAsset") imagePathAsset;
  @Output() translate$: EventEmitter<any> = new EventEmitter<any>();
  languagePrefrence: any = null;
  isPopUp: any = null;

  constructor(
    private commonService: CommonService,
    private localAuthService: LocalAuthService
  ) {}

  ngOnInit(): void {
    this.languagePrefrence = sessionStorage.getItem("languagePrefrence");
    this.isPopUp = sessionStorage.getItem("isPopUp");
    const userSession = this.localAuthService.getUserSession();
    if (
      userSession &&
      userSession["authenticated"] == "true" &&
      this.languagePrefrence != null  &&
      this.languagePrefrence != userSession["languagePrefrence"]
    ) {
      this.updateUserLanguagePrefrence(userSession);
    }
  }

  private updateUserLanguagePrefrence(userSession) {
    const params = "customerId=" + userSession["userId"] + "&languageCode=" + this.languagePrefrence;
    this.commonService.postUserLanguagePrefrence(params).subscribe((result) => {
      if (result && result["status"]) {
        console.log("user data updated :: ------------==>", result);
      }
    });
  }

  closeLanguagePopup(language) {
    sessionStorage.setItem("languagePrefrence", language);
    this.languagePrefrence = language;
  }

  translate() {
    this.translate$.emit();
  }

  closePopUp(){
    sessionStorage.setItem("isPopUp", "true");
    this.isPopUp = "true";
  }
}

@NgModule({
  declarations: [SelectLanguageComponent],
  imports: [CommonModule],
  exports: [SelectLanguageComponent],
})
export class SelectLanguageModule {}
