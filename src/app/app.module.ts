import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

// ionic-native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { Media } from '@ionic-native/media';
import { NFC, Ndef } from '@ionic-native/nfc';
// providers
import { FileProvider } from '../providers/file';
import { MediaProvider } from '../providers/media';
import { NFCProvider } from '../providers//nfc';
// pages
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { NFCReaderPage } from '../pages/nfc-reader/nfc-reader';
import { NFCWriterPage } from '../pages/nfc-writer/nfc-writer';
import { NFCWriterAdvancedPage } from '../pages/nfc-writer-advanced/nfc-writer-advanced';
import { NDEFReaderPage } from '../pages/ndef-reader/ndef-reader';
import { MIMEReaderPage } from '../pages/mime-reader/mime-reader';
import { MoodSetterPage } from '../pages/mood-setter/mood-setter';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    NFCReaderPage,
    NFCWriterPage,
    NFCWriterAdvancedPage,
    NDEFReaderPage,
    MIMEReaderPage,
    MoodSetterPage
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
    NFCWriterPage,
    NFCWriterAdvancedPage,
    NDEFReaderPage,
    MIMEReaderPage,
    MoodSetterPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    Media,
    NFC,
    Ndef,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FileProvider,
    MediaProvider,
    NFCProvider
  ]
})
export class AppModule {}
