import { Injectable } from '@angular/core';
import { NFC, Ndef, NdefRecord } from '@ionic-native/nfc';
import { Observable } from 'rxjs';

@Injectable()
export class NFCProvider {

  TNF_WELL_KNOWN: number;
  TNF_EXTERNAL_TYPE: number;
  RTD_TEXT: number[];
  RTD_URI: number[];

  constructor(public nfc: NFC, public ndef: Ndef) {
    this.TNF_WELL_KNOWN = this.ndef.TNF_WELL_KNOWN;
    this.TNF_EXTERNAL_TYPE = this.ndef.TNF_EXTERNAL_TYPE;
    this.RTD_TEXT = this.ndef.RTD_TEXT;
    this.RTD_URI = this.ndef.RTD_URI;
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

  /**
   * Convert string to byte array.
   * @param str {string}
   * @returns {number[]}
   */
  stringToBytes(str: string): number[] {
    return this.nfc.stringToBytes(str);
  }

  record(tnf: number, type: number[] | string, id: number[] | string, payload: number[] | string): NdefRecord {
    return this.ndef.record(tnf,type,id,payload);
  }

  textRecord(text: string, languageCode?: string, id?: number[] | string): NdefRecord {
    return this.ndef.textRecord(text,languageCode,id);
  }

  uriRecord(uri: string, id?: number[] | string): NdefRecord {
    return this.ndef.uriRecord(uri,id);
  }

  mimeMediaRecord(mimeType: string, payload: string): NdefRecord {
    return this.ndef.mimeMediaRecord(mimeType,payload);
  }

  smartPoster(ndefRecords: any[], id?: number[] | string): NdefRecord {
    return this.smartPoster(ndefRecords,id);
  }
}
