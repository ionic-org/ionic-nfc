import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc/nfc';

@Component({
  selector: 'page-nfc-writer',
  templateUrl: 'nfc-writer.html',
})
export class NFCWriterPage {
  ready: boolean = false;

  tip: string;

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

      if (this.platform.is('cordova')) {
        console.log("platform is cordova");
        this.addTagDiscoveredListener();
      } else {
        // this.addTagTestData()
      }
    })
  }

  ionViewWillUnload() {
    this.nfcProvider.removeTagDiscoveredListener(() => {
      console.log("移除监听成功");
    }, err => {
      console.error("移除监听失败");
    })
  }

  addTagDiscoveredListener() {
    this.nfcProvider.addTagDiscoveredListener(() => {
      console.log('nfc addTagDiscoveredListener success');

      this.messageToWrite = this.makeMessage();
      this.tip = "NDEF消息数据创建成功";
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
    let tnf = this.nfcProvider.ndef.TNF_EXTERNAL_TYPE;
    // NDEF Record Type
    let recordType = "android.com:pkg";
    // content of the record
    // com.tencent.mm 微信包名
    let recordPayload = "com.blueearth.idc";
    // NDEF record object
    // let record = [];
    // NDEF Message to pass to writeTag()  


    // create the actual NDEF record:
    let NDEF_Record = this.nfcProvider.ndef.record(tnf, recordType, [], recordPayload);
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
