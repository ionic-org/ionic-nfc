import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc/nfc';
import { Subscription } from 'rxjs';
import { NdefRecord } from '@ionic-native/nfc';

@Component({
  selector: 'page-nfc-writer',
  templateUrl: 'nfc-writer.html',
})
export class NFCWriterPage {
  ready: boolean = false;

  tip: string;

  obser: Subscription;

  messageToWrite: Array<any>;
  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private nfcProvider: NFCProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NFCWriterPage');

    this.platform.ready().then(() => {
      console.log("platform ready");
      this.ready = true;
      this.tip = "platform ready"

      if (this.platform.is('cordova')) {
        console.log("platform is cordova");
        this.addTagDiscoveredListener();
      } else {
        this.tip = "not cordova"
        // this.addTagTestData()
      }
    })
  }

  ionViewWillUnload() {
    if (this.obser) {
      this.obser.unsubscribe();
    }
  }

  addTagDiscoveredListener() {
    this.nfcProvider.addTagDiscoveredListener(() => {
      console.log('nfc addTagDiscoveredListener success');

      this.messageToWrite = this.makeMessage();
      let NDEF_Record: NdefRecord = this.messageToWrite[0];
      this.tip = "NDEF消息数据创建成功:" + NDEF_Record.payload;
    }, err => {
      console.error('nfc addTagDiscoveredListener error:' + JSON.stringify(err));
    }).subscribe((event) => {
      console.log("nfc addTagDiscoveredListener subscribe:" + JSON.stringify(event));
      this.tip = "正在写入";
      this.writeTag(this.messageToWrite);
    })
  }

  makeMessage() {
    let NDEF_Message = [];

    // NDEF Type Name Format
    let tnf = this.nfcProvider.TNF_EXTERNAL_TYPE;
    // NDEF Record Type
    let recordType = "android.com:pkg";
    // content of the record
    // com.tencent.mm 微信包名
    let recordPayload = "com.tencent.mm";
    // let recordPayload = "com.blueearth.idc";
    // NDEF record object
    // let record = [];
    // NDEF Message to pass to writeTag()  


    // create the actual NDEF record:
    let NDEF_Record: NdefRecord = this.nfcProvider.record(tnf, recordType, [], recordPayload);
    // put the record in the message array:
    NDEF_Message.push(NDEF_Record);

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
