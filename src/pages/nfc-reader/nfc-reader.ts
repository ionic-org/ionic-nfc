import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc/nfc';
import { NdefEvent } from '@ionic-native/nfc';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-nfc-reader',
  templateUrl: 'nfc-reader.html',
})
export class NFCReaderPage {

  ready: boolean = false;

  tagEvent: any;
  tagId: string;
  obser:  Subscription;

  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private nfcProvider: NFCProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NFCReaderPage');
    this.platform.ready().then(() => {
      console.log("platform ready");
      this.ready = true;

      if (this.platform.is('cordova')) {
        console.log("platform is cordova");
        this.addTagDiscoveredListener();
      } else {
        this.addTagTestData()
      }
    })
  }

  ionViewWillUnload() {
    if (this.obser) {
      this.obser.unsubscribe();
    }
  }

  addTagTestData() {
    this.tagEvent = {
      "isTrusted": false,
      "tag": {
        "id": [
          -18,
          91,
          -41,
          43
        ],
        "techTypes": [
          "android.nfc.tech.NfcA",
          "android.nfc.tech.MifareClassic",
          "android.nfc.tech.NdefFormatable"
        ]
      }
    }

    this.tagId = this.bytesToHexString(this.tagEvent.tag.id);
  }

  addTagDiscoveredListener() {
    this.obser  = this.nfcProvider.addTagDiscoveredListener(() => {
      console.log('nfc-reader addTagDiscoveredListener 成功');
    }, err => {
      console.error('nfc-reader addTagDiscoveredListener 失败:' + JSON.stringify(err));
    }).subscribe((event) => {
      console.log("nfc-reader addTagDiscoveredListener subscribe:" + JSON.stringify(event));
      this.tagEvent = event;

      /*
      {
          "isTrusted": false,
          "tag": {
            "id": [
              -18,
              91,
              -41,
              43
            ],
            "techTypes": [
              "android.nfc.tech.NfcA",
              "android.nfc.tech.MifareClassic",
              "android.nfc.tech.NdefFormatable"
            ]
          }
        }
      */
      console.log('nfc-reader received ndef message. the tag contains: ' + JSON.stringify(event.tag));

      this.tagId = this.nfcProvider.bytesToHexString(event.tag.id)
      console.log("Read tag: " + this.tagId);

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

}
