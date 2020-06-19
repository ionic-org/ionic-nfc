import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

// ionic-native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';

// pages
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { NFCReaderPage } from '../pages/nfc-reader/nfc-reader';
import { NFCWriterPage } from '../pages/nfc-writer/nfc-writer';

// providers
import { NFCProvider } from '../providers/nfc/nfc';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    NFCReaderPage,
    NFCWriterPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    NFCReaderPage,
    NFCWriterPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NFC,
    Ndef,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NFCProvider
  ]
})
export class AppModule {}
