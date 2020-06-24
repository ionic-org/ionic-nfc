import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc';

@Component({
  selector: 'page-mime-reader',
  templateUrl: 'mime-reader.html',
})
export class MIMEReaderPage {

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public nfcProvider: NFCProvider) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      console.log("platform ready");
      if (this.platform.is('cordova')) {
        this.addMimeTypeListener();
      } else {
        console.log('not cordova')
      }
    })
  }

  addMimeTypeListener() {
    this.nfcProvider.addMimeTypeListener("text/plain", () => {
      this.display("Tap an NFC tag to begin");
    }, error => {
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent: any) => {
      let tag = nfcEvent.tag;
      let text = "";
      let payload;

      this.clear();
      this.display("Read tag: " + this.nfcProvider.bytesToHexString(tag.id));

      // get the playload from the first message
      payload = tag.ndefMessage[0].payload;

      if (payload[0] < 5) {
        // payload begins with a small integer, it's encoded text
        let languageCodeLength = payload[0];

        // chop off the language code and convert to string
        text = this.nfcProvider.bytesToString(payload.slice(languageCodeLength + 1));

      } else {
        // assume it's text without language info
        text = this.nfcProvider.bytesToString(payload);
      }

      this.display("Message: " + text);

    })
  }

  clear() {
    let messageDiv = document.getElementById('messageDiv');
    messageDiv.innerHTML = "";
  }

  display(message) {
    let messageDiv = document.getElementById('messageDiv');
    let label = document.createTextNode(message);
    let lineBreak = document.createElement("br");
    messageDiv.appendChild(lineBreak);
    messageDiv.appendChild(label);
  }
}
