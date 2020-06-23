import { Injectable } from '@angular/core';
import { NFC, Ndef, NdefRecord, NdefEvent } from '@ionic-native/nfc';
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

  /** 发现标签监听器
   * Registers an event listener for tags matching any tag type.
   * 监听所有与读取器硬件能兼容的标签，这是最常用的监听器
   */
  addTagDiscoveredListener(onSuccess?: Function, onFailure?: Function): Observable<any> {
    return this.nfc.addTagDiscoveredListener(onSuccess, onFailure);
  }

  /** NDEF格式监听器
   * Registers an event listener for formatable NDEF tags.
   * 监听可以格式化接收NDEF信息的所有兼容标签
   */
  addNdefFormatableListener(onSuccess?: Function, onFailure?: Function): Observable<any> {
    return this.nfc.addNdefFormatableListener(onSuccess, onFailure);
  }

  /** NDEF监听器
   * Registers an event listener for any NDEF tag.
   * 监听任何包含NDEF信息的标签，如果监听到合法的NDEF信息，该监听器将产生一个事件
   */
  addNdefListener(onSuccess?: Function, onFailure?: Function): Observable<NdefEvent> {
    return this.nfc.addNdefListener(onSuccess, onFailure);
  }

  /** MIME类型监听器
   * Registers an event listener for NDEF tags matching a specified MIME type.
   * 这种类型的监听器仅仅监听包含MIME类型的NDEF信息.
   * 这是所有事件监听器中最特别也是最有用的.
   * 你可以使用MIME类型的监听器过滤包含有指定MIME类型的信息，这样它就能忽略其他的MIME类型.
   * 同样也可以使用它过滤掉那些不包含任何类型的信息。
   * 然而，你无法为不同的类型设置两个MIME类型的监听器。
   */
  addMimeTypeListener(mimeType: string, onSuccess?: Function, onFailure?: Function): Observable<any> {
    return this.nfc.addMimeTypeListener(mimeType,onSuccess,onFailure);
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

  /**
   * 
   * @param tnf - 理论上NDEF消息有8种TNF，但大部分应用程序只用到3种：Well-Known、MIME和External
   * @param type - 记录类型
   * @param id
   * @param payload - 有效载荷
   */
  record(tnf: number, type: number[] | string, id: number[] | string, payload: number[] | string): NdefRecord {
    return this.ndef.record(tnf, type, id, payload);
  }

  /** 常用 Android App 包名
   * com.tencent.mm 微信
   * com.tencent.mobileqq QQ
   * com.tencent.tmgp.sgame 王者荣耀
   * com.xunmeng.pinduoduo 拼多多
   * com.jingdong.app.mall 京东
   * com.taobao.taobao 淘宝
   * com.eg.android.AlipayGphone 支付宝
   * com.alibaba.android.rimet 钉钉
   * com.sina.weibo 微博
   * com.ss.android.ugc.aweme 抖音
   * com.qiyi.video 爱奇艺
   * com.sankuai.meituan 美团
   * com.sankuai.meituan.takeoutnew 美团外卖
   * com.sankuai.meituan.takeoutnew 12306
   * ctrip.android.view 携程
   */
  androidApplicationRecord(packageName: string): NdefRecord {
    return this.ndef.androidApplicationRecord(packageName);
  }

  /**
   * textRecord 使用Well-Known TNF和文本记录类型来创建文本记录。如果没有指定语言，则默认为英语
   * @param text 
   * @param languageCode 
   * @param id 
   */
  textRecord(text: string, languageCode?: string, id?: number[] | string): NdefRecord {
    return this.ndef.textRecord(text, languageCode, id);
  }

  /**
   * uriRecord 构建了一条TNF 01（Well-Known）、记录类型是“U”的记录，代表发送的是URI.
   * uriRecord 将会用UIC来缩短URI。在本例中，m.foursquare.com前的http://将被0x03替换并写入标签
   * ```ts
   * record = ndef.uriRecord("http://m.foursquare.com/");
   * ```
   * @param uri 
   * @param id 
   */
  uriRecord(uri: string, id?: number[] | string): NdefRecord {
    return this.ndef.uriRecord(uri, id);
  }

  /**
   * 
   * @param mimeType - MIME类型
   * @param payload - 载荷
   */
  mimeMediaRecord(mimeType: string, payload: string): NdefRecord {
    return this.ndef.mimeMediaRecord(mimeType, payload);
  }

  /**
   * smartPoster 从其他记录构建智能海报
   * @param ndefRecords 
   * @param id 
   */
  smartPoster(ndefRecords: any[], id?: number[] | string): NdefRecord {
    return this.ndef.smartPoster(ndefRecords, id);
  }

  /**
   * emptyRecord 创建一个空记录，让你来填充
   */
  emptyRecord(): NdefRecord {
    return this.ndef.emptyRecord();
  }
}
