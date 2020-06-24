import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc';

@Component({
  selector: 'page-nfc-writer',
  templateUrl: 'nfc-writer.html',
})
export class NFCWriterPage {
  messageToWrite: Array<any>;
  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private nfcProvider: NFCProvider) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.addTagDiscoveredListener();
      }
    })
  }

  addTagDiscoveredListener() {
    this.nfcProvider.addTagDiscoveredListener(() => {
      this.messageToWrite = this.makeMessage();
      this.display("Tap an NFC tag to write data");
    }, error => {
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent) => {
      this.writeTag(this.messageToWrite);
    })
  }

  makeMessage() {
    let NDEF_Message = [];
    let NDEF_Record = this.nfcProvider.androidApplicationRecord("com.tencent.mm");
    NDEF_Message.push(NDEF_Record);

    return NDEF_Message;
  }

  writeTag(message) {
    // write the record to the tag:
    this.nfcProvider.write(message).then(() => {
      this.display("Wrote data to tag.");
    }).catch(reason => {
      this.display("There was a problem " + reason);
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
