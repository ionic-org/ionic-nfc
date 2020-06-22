import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Observable } from 'rxjs';

@Injectable()
export class NFCProvider {

  constructor(public nfc: NFC, public ndef: Ndef) {
  }

  addTagDiscoveredListener(onSuccess?: Function, onFailure?: Function): Observable<any> {
    return this.nfc.addTagDiscoveredListener(onSuccess, onFailure);
  }

  write(message: any[]): Promise<any> {
    return this.nfc.write(message);
  }

  /**
   * Convert byte array to hex string
   *
   * @param bytes {number[]}
   * @returns {string}
   */
  bytesToHexString(bytes: number[]): string {
    return this.nfc.bytesToHexString(bytes);
  }

}
