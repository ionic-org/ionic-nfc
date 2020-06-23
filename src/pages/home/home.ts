import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { NFCReaderPage } from '../nfc-reader/nfc-reader';
import { NFCWriterPage } from '../nfc-writer/nfc-writer';
import { NFCWriterAdvancedPage } from '../nfc-writer-advanced/nfc-writer-advanced';
import { NDEFReaderPage } from '../ndef-reader/ndef-reader';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public platform: Platform,
    public navCtrl: NavController) {

  }

  ionViewDidLoad() {
    console.log(this.platform.platforms());
  }

  clickRead(type: number) {
    switch (Number(type)) {
      case 1:
        this.navCtrl.push(NFCReaderPage);
        break;
      case 2:
        this.navCtrl.push(NDEFReaderPage);
        break;
      default:
        break;
    }

  }

  clickWrite(type: number) {
    switch (Number(type)) {
      case 1:
        this.navCtrl.push(NFCWriterPage);
        break;
      case 2:
        this.navCtrl.push(NFCWriterAdvancedPage);
        break;
      default:
        break;
    }
  }
}
