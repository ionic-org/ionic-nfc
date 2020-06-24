import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc';

@Component({
  selector: 'page-nfc-reader',
  templateUrl: 'nfc-reader.html',
})
export class NFCReaderPage {

  ready: boolean = false;

  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private nfcProvider: NFCProvider
  ) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      console.log("platform ready");
      this.ready = true;

      if (this.platform.is('cordova')) {
        this.addTagDiscoveredListener();
      }
    })
  }

  addTagDiscoveredListener() {
    this.nfcProvider.addTagDiscoveredListener(() => {
      this.display("Tap a tag to read its id number.");
    }, error => {
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent) => {
      let tag = nfcEvent.tag;
      this.display("Read tag: " + this.nfcProvider.bytesToHexString(tag.id));
    })
  }

  bytesToHexString(bytes) {
    var dec, hexstring, bytesAsHexString = "";
    for (var i = 0; i < bytes.length; i++) {
      if (bytes[i] >= 0) {
        dec = bytes[i];
      } else {
        dec = 256 + bytes[i];
      }
      hexstring = dec.toString(16);
      // zero padding
      if (hexstring.length === 1) {
        hexstring = "0" + hexstring;
      }
      bytesAsHexString += hexstring;
    }
    return bytesAsHexString;
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
