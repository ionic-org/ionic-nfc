import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { NFCProvider } from '../../providers/nfc/nfc';

@Component({
  selector: 'page-ndef-reader',
  templateUrl: 'ndef-reader.html',
})
export class NDEFReaderPage {
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
        this.addListener();
      } else {
        console.log('not cordova')
      }
    });
  }

  addListener() {
    this.nfcProvider.addTagDiscoveredListener((status) => {
      // listener successfully initialized
      this.display("Listening for NFC tags.");
    }, (error) => {
      // listener fails to initialize
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent) => {
      // tag successfully scanned
      // onNonNdef
      this.dealNonNDEF(nfcEvent);
    });

    this.nfcProvider.addNdefFormatableListener((status) => {
      // listener successfully initialized
      this.display("Listening for NDEF Formatable tags.");
    }, (error) => {
      // listener fails to initialize
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent) => {
      // tag successfully scanned
      // onNonNdef
      this.dealNonNDEF(nfcEvent);
    });

    this.nfcProvider.addNdefListener((status) => {
      // listener successfully initialized
      this.display("Listening for NDEF messages.");
    }, (error) => {
      // listener fails to initialize
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent: any) => {
      // tag successfully scanned
      // onNfc
      this.dealNFC(nfcEvent);
    });

    this.nfcProvider.addMimeTypeListener("text/plain", (status) => {
      // listener successfully initialized
      this.display("Listening for plain text MIME Types.");
    }, (error) => {       // listener fails to initialize
      this.display("NFC reader failed to initialize " + JSON.stringify(error));
    }).subscribe((nfcEvent: any) => {
      // tag successfully scanned
      // onNfc
      this.dealNFC(nfcEvent);
    });
  }

  clear() {
    let messageDiv = document.getElementById('messageDiv');
    messageDiv.innerHTML = "";
  }

  display(message) {
    let messageDiv = document.getElementById('messageDiv');
    let label = document.createTextNode(message)
    let lineBreak = document.createElement("br");
    messageDiv.appendChild(lineBreak);         // add a line break
    messageDiv.appendChild(label);             // add the text
  }

  /**
   *  Process NDEF tag data from the nfcEvent
   */
  dealNFC(nfcEvent: any) {
    this.clear();
    this.display(" Event Type: " + nfcEvent.type);
    this.showTag(nfcEvent.tag);
  }

  /*
      Process non-NDEF tag data from the nfcEvent
      This includes 
       * Non NDEF NFC Tags
       * NDEF Formatable Tags
       * Mifare Classic Tags on Nexus 4, Samsung S4 
       (because Broadcom doesn't support Mifare Classic)
   */
  dealNonNDEF(nfcEvent: any) {
    // 读取标签的UID以及标签的信息，然后添加一个showTag（）函数去显示从onNfc（）函数中得到的标签信息
    this.clear();
    // display the event type:
    this.display("Event Type: " + nfcEvent.type);
    var tag = nfcEvent.tag;
    this.display("Tag ID: " + this.nfcProvider.bytesToHexString(tag.id));
    this.display("Tech Types: ");
    for (var i = 0; i < tag.techTypes.length; i++) {
      this.display("  * " + tag.techTypes[i]);
    }
  }

  /**
   * writes @tag to the message div:
   */
  showTag(tag) {
    // display the tag properties:
    this.display("Tag ID: " + this.nfcProvider.bytesToHexString(tag.id));
    this.display("Tag Type: " + tag.type);
    this.display("Max Size: " + tag.maxSize + " bytes");
    this.display("Is Writable: " + tag.isWritable);
    this.display("Can Make Read Only: " + tag.canMakeReadOnly);

    // if there is an NDEF message on the tag, display it:
    var thisMessage = tag.ndefMessage;
    if (thisMessage !== null) {
      // get and display the NDEF record count:
      this.display("Tag has NDEF message with " + thisMessage.length
        + " record" + (thisMessage.length === 1 ? "." : "s."));

      // switch is part of the extended example
      var type = this.nfcProvider.bytesToString(thisMessage[0].type);
      switch (type) {
        case this.nfcProvider.bytesToString(this.nfcProvider.RTD_TEXT):
          this.display("Looks like a text record to me.");
          break;
        case this.nfcProvider.bytesToString(this.nfcProvider.RTD_URI):
          this.display("That's a URI right there");
          break;
        case this.nfcProvider.bytesToString(this.nfcProvider.RTD_SMART_POSTER):
          this.display("Golly!  That's a smart poster.");
          break;
        // add any custom types here,
        // such as MIME types or external types:
        case 'android.com:pkg':
          this.display("You've got yourself an AAR there.");
          break;
        default:
          this.display("I don't know what " +
            type +
            " is, must be a custom type");
          break;
      }
      // end of extended example

      this.display("Message Contents: ");
      this.showMessage(thisMessage);
    }
  }

  showMessage(message) {
    for (var i = 0; i < message.length; i++) {
      // get the next record in the message array:
      var record = message[i];
      this.showRecord(record);          // show it
    }
  }

  showRecord(record) {
    // display the TNF, Type, and ID:
    this.display(" ");
    this.display("TNF: " + record.tnf);
    this.display("Type: " + this.nfcProvider.bytesToString(record.type));
    this.display("ID: " + this.nfcProvider.bytesToString(record.id));

    // if the payload is a Smart Poster, it's an NDEF message.
    // read it and display it (recursion is your friend here):
    if (this.nfcProvider.bytesToString(record.type) === "Sp") {
      var ndefMessage = this.nfcProvider.decodeMessage(record.payload);
      this.showMessage(ndefMessage);

      // if the payload's not a Smart Poster, display it:
    } else {
      this.display("Payload: " + this.nfcProvider.bytesToString(record.payload));
    }
  }
}
