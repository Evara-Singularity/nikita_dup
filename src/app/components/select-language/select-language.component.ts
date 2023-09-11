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
import { LocalStorageService } from "ngx-webstorage";

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
    private localAuthService: LocalAuthService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.languagePrefrence = this.localStorageService.retrieve("languagePrefrence");
    this.isPopUp = localStorage.getItem("isPopUp");
    this.updateUserLanguagePrefrence();
  }

  private updateUserLanguagePrefrence() {
    const userSession = this.localAuthService.getUserSession();
    if (
      userSession &&
      userSession["authenticated"] == "true" &&
      this.languagePrefrence != null  &&
      this.languagePrefrence != userSession["preferredLanguage"]
    ) {
      const params = "customerId=" + userSession["userId"] + "&languageCode=" + this.languagePrefrence;
      this.commonService.postUserLanguagePrefrence(params).subscribe(result=>{
        if(result && result['status'] == true){
          const selectedLanguage = result['data'] && result['data']['languageCode'];
          const newUserSession = Object.assign({}, this.localAuthService.getUserSession());
          newUserSession.preferredLanguage = selectedLanguage;
          this.localAuthService.setUserSession(newUserSession);
        }
      });
    }
  }

  closeLanguagePopup(language) {
    this.localStorageService.store("languagePrefrence", language);
    this.languagePrefrence = language;
    localStorage.setItem("isPopUp", "true");
    this.isPopUp = "true";
    this.updateUserLanguagePrefrence();
  }

  translate() {
    this.localStorageService.store("languagePrefrence", "hi");
    this.languagePrefrence = "hi";
    localStorage.setItem("isPopUp", "true");
    this.isPopUp = "true";
    this.updateUserLanguagePrefrence();
    this.translate$.emit();
  }

  closePopUp(){
    localStorage.setItem("isPopUp", "true");
    this.isPopUp = "true";
  }
}

@NgModule({
  declarations: [SelectLanguageComponent],
  imports: [CommonModule],
  exports: [SelectLanguageComponent],
})
export class SelectLanguageModule {}
