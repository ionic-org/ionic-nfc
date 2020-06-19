import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';

@Injectable()
export class NFCProvider {

  constructor(private nfc: NFC, private ndef: Ndef) {
  }

}
