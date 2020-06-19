import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NFCProvider {

  constructor(public nfc: NFC, public ndef: Ndef) {
  }

  addTagDiscoveredListener(onSuccess?: Function, onFailure?: Function): Observable<any> {
    return this.nfc.addTagDiscoveredListener(onSuccess, onFailure);
  }

  removeTagDiscoveredListener(onSuccess?: Function, onFailure?: Function): Observable<any> {
    return this.nfc.removeTagDiscoveredListener(onSuccess, onFailure);
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
