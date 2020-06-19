import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NFCReaderPage } from '../nfc-reader/nfc-reader';
import { NFCWriterPage } from '../nfc-writer/nfc-writer';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  ionViewDidLoad() {
    
  }

  clickRead() {
    this.navCtrl.push(NFCReaderPage);
  }

  clickWrite() {
    this.navCtrl.push(NFCWriterPage);
  }
}
