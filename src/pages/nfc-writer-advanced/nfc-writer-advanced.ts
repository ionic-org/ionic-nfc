import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc/nfc';
import { NdefRecord } from '@ionic-native/nfc';

@Component({
  selector: 'page-nfc-writer-advanced',
  templateUrl: 'nfc-writer-advanced.html',
})
export class NFCWriterAdvancedPage {

  appPicker: any;
  messageToWrite: Array<NdefRecord>;
  tip: string;

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
        this.addTagDiscoveredListener();
      } else {

      }
    })
  }

  selectChange() {
    console.log(this.appPicker);
    this.tip = "select Change:" + this.appPicker;
    this.messageToWrite = this.makeMessage();
    console.log("messageToWrite:" + JSON.stringify(this.messageToWrite));
  }

  addTagDiscoveredListener() {
    this.nfcProvider.addTagDiscoveredListener(() => {
      console.log('nfc addTagDiscoveredListener success');

      this.messageToWrite = this.makeMessage();
    }, err => {
      console.error('nfc addTagDiscoveredListener error:' + JSON.stringify(err));
    }).subscribe((event) => {
      console.log("nfc addTagDiscoveredListener subscribe:" + JSON.stringify(event));
      this.tip = "正在写入";
      console.log("messageToWrite:" + JSON.stringify(this.messageToWrite));
      this.writeTag(this.messageToWrite);
    })
  }

  makeMessage() {
    let NDEF_Message = [];
    // NDEF Type Name Format
    let tnf;
    // NDEF Record Type    
    let recordType;
    // content of the record   
    let recordPayload;
    // NDEF record object
    let NDEF_Record: NdefRecord;

    switch (Number(this.appPicker)) {
      case 1: // like NFC Task Launcher
        // 创建一条MIME类型的记录
        recordType = "x/nfctl";
        recordPayload = "enZ:Foursquare;c:4a917563f964a520401a20e3";
        NDEF_Record = this.nfcProvider.mimeMediaRecord(recordType, recordPayload);
        NDEF_Message.push(NDEF_Record); // push the record onto the message

        
        NDEF_Record = this.nfcProvider.androidApplicationRecord("com.tencent.mm");
        NDEF_Message.push(NDEF_Record); // push the record onto the message
        break;
      case 2: // like Tagstand Writer
        // format the URI record as a Well-Known Type:
        tnf = this.nfcProvider.TNF_WELL_KNOWN;
        recordType = this.nfcProvider.RTD_URI; // add the URI record type
        // convert to an array of bytes:
        recordPayload = this.nfcProvider.stringToBytes(
          "m.foursquare.com/venue/4a917563f964a520401a20e3");
        // add the URI identifier code for "http://":
        recordPayload.unshift(0x03);
        NDEF_Record = this.nfcProvider.record(tnf, recordType, [], recordPayload);
        NDEF_Message.push(NDEF_Record); // push the record onto the message
        break;
      case 3: // like NXP TagWriter
        // The payload of a Smart Poster record is an NDEF message
        // so create an array of two records like so:
        var smartPosterPayload = [
          this.nfcProvider.uriRecord(
            "http://m.foursquare.com/venue/4a917563f964a520401a20e3"),
          this.nfcProvider.textRecord("foursquare checkin"),
        ];

        // Create the Smart Poster Record from the array:
        NDEF_Record = this.nfcProvider.smartPoster(smartPosterPayload);
        // push the smart poster record onto the message:
        NDEF_Message.push(NDEF_Record);
        break;
      case 4: // like TecTiles
        // format the record as a Well-Known Type
        tnf = this.nfcProvider.TNF_WELL_KNOWN;
        recordType = this.nfcProvider.RTD_URI; // add the URI record type
        var uri = "tectiles://www.samsung.com/tectiles";
        recordPayload = this.nfcProvider.stringToBytes(uri);
        var id = this.nfcProvider.stringToBytes("0");
        // URI identifier 0x00 because there's no ID for "tectile://":
        recordPayload.unshift(0x00);
        NDEF_Record = this.nfcProvider.record(tnf, recordType, id, recordPayload);
        NDEF_Message.push(NDEF_Record); // push the record onto the message

        // text record with binary data
        tnf = this.nfcProvider.TNF_WELL_KNOWN;
        recordType = this.nfcProvider.RTD_TEXT;
        recordPayload = [];
        // language code length
        recordPayload.push(2);
        // language code
        recordPayload.push.apply(recordPayload, this.nfcProvider.stringToBytes("en"));
        // Task Name
        recordPayload.push.apply(recordPayload, this.nfcProvider.stringToBytes("Task"));
        // 4-byte token proprietary to TecTiles:
        recordPayload.push.apply(recordPayload, [10, 31, 29, 19]);
        // Application Name
        recordPayload.push.apply(recordPayload, this.nfcProvider.stringToBytes("Foursquare"));
        // NULL terminator
        recordPayload.push(0);
        // Activity to launch
        recordPayload.push.apply(recordPayload, this.nfcProvider.stringToBytes(
          "com.joelapenna.foursquared.MainActivity"));
        // NULL terminator
        recordPayload.push(0);
        // Application packageName
        recordPayload.push.apply(recordPayload, this.nfcProvider.stringToBytes(
          "com.joelapenna.foursquared"));
        id = this.nfcProvider.stringToBytes("1");
        NDEF_Record = this.nfcProvider.record(tnf, recordType, id, recordPayload);
        NDEF_Message.push(NDEF_Record); // push the record onto the message
        break;

      case 5: 
        NDEF_Record = this.nfcProvider.androidApplicationRecord("com.tencent.mobileqq");
        NDEF_Message.push(NDEF_Record); // push the record onto the message
        break;
    }
    return NDEF_Message;
  }

  writeTag(message) {
    // write the record to the tag:
    this.nfcProvider.write(message).then(() => {
      console.log("write success");
      // when complete, run this callback function:
      this.tip = "写入成功"
    }).catch(reason => {
      // this function runs if the write command fails:
      console.error("writeTag fail:" + reason);
      this.tip = "写入失败" + reason;
    })
  }

}
