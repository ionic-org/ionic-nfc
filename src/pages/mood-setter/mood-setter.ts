import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DirectoryEntry } from '@ionic-native/file';
import { MediaObject, MEDIA_ERROR, MEDIA_STATUS } from '@ionic-native/media';
import { FileProvider } from '../../providers/file';
import { MediaProvider } from '../../providers/media';
import { NFCProvider } from '../../providers/nfc';
declare let $;

@Component({
  selector: 'page-mood-setter',
  templateUrl: 'mood-setter.html',
})
export class MoodSetterPage {
  hub = {                       // a copy of the hue settings
    lights: {},                    // states & names for the individual lights
    ipaddress: null,               // ip address of the hue
    appTitle: "NFC Mood Setter",   // The App name   
    username: "MoodSetterApp",     // the App's username
    currentLight: 1                // the light you're currently setting
  };

  app = {
    mode: 'write',                 // the tag read/write mode
    mimeType: 'text/hue',          // the NFC record MIME Type
    musicPath: 'file:///sdcard/myMusic/',   // path to your music
    songTitle: null,               // title of the song
    musicState: 0,                 // state of the song: playing stopped, etc.
    songUri: null
  }

  songPlaying: MediaObject = null;

  nav: any = navigator

  modeButton = document.getElementById('modeButton');
  modeValue = document.getElementById('modeValue');
  tagModeMessage = document.getElementById('tagModeMessage');

  bri: HTMLInputElement = <HTMLInputElement>document.getElementById('bri');
  hue: HTMLInputElement = <HTMLInputElement>document.getElementById('hue');
  sat: HTMLInputElement = <HTMLInputElement>document.getElementById('sat');
  lightOn: HTMLInputElement = <HTMLInputElement>document.getElementById('lightOn');
  lightNumber: HTMLSelectElement = <HTMLSelectElement>document.getElementById('lightNumber');
  songs: HTMLSelectElement = <HTMLSelectElement>document.getElementById('songs');
  playButton = document.getElementById('playButton');
  stopButton = document.getElementById('stopButton');

  messageDiv = document.getElementById('messageDiv');

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private navParams: NavParams,
    private nfcProvider: NFCProvider,
    private mediaProvider: MediaProvider,
    private fileProvider: FileProvider) {
  }

  ionViewDidLoad() {
    this.nav = navigator;

    this.modeButton = document.getElementById('modeButton');
    this.modeValue = document.getElementById('modeValue');
    this.tagModeMessage = document.getElementById('tagModeMessage');

    this.bri = <HTMLInputElement>document.getElementById('bri');
    this.hue = <HTMLInputElement>document.getElementById('hue');
    this.sat = <HTMLInputElement>document.getElementById('sat');
    this.lightOn = <HTMLInputElement>document.getElementById('lightOn');
    this.lightNumber = <HTMLSelectElement>document.getElementById('lightNumber');
    this.songs = <HTMLSelectElement>document.getElementById('songs');
    this.playButton = document.getElementById('playButton');
    this.stopButton = document.getElementById('stopButton');

    this.messageDiv = document.getElementById('messageDiv');

    this.bindEvents();
  }

  bindEvents() {
    this.platform.ready().then(() => {
      this.onDeviceReady();
    })

    // hue faders from the UI: brightness, hue, saturation:
    this.bri.addEventListener('touchend', this.setBrightness, false);
    this.hue.addEventListener('touchend', this.setHue, false);
    this.sat.addEventListener('touchend', this.setSaturation, false);
    this.lightOn.addEventListener('change', this.setLightOn, false);
    this.lightNumber.addEventListener('change', this.getHueSettings, false);

    // buttons from the UI:
    this.modeButton.addEventListener('click', this.setMode, false);
    this.songs.addEventListener('change', this.onSongChange, false);
    this.playButton.addEventListener('touchstart', this.toggleAudio, false);
    this.stopButton.addEventListener('touchstart', this.stopAudio, false);

    // pause and resume functionality for the whole app:
    document.addEventListener('pause', this.onPause, false);
    document.addEventListener('resume', this.onResume, false);
  }

  onDeviceReady() {
    this.clear();                   // clear any messages onscreen
    this.findControllerAddress();   // find address and get settings
    this.setMode();                 // set the read/write mode for tags

    if (this.platform.is('cordova')) {
      // listen for NDEF Formatable tags (for write mode):
      this.nfcProvider.addNdefFormatableListener((status) => {         // listener successfully initialized
        console.log("Listening for NDEF-formatable tags.");
      }, (error) => {          // listener fails to initialize
        this.display("NFC reader failed to initialize " +
          JSON.stringify(error));
      }
      ).subscribe((nfcEvent) => {
        this.onWritableNfc(nfcEvent);
      });

      // listen for NDEF tags so you can overwrite MIME message onto them
      this.nfcProvider.addNdefListener(() => {                // listener successfully initialized
        console.log("listening for Ndef tags");
      }, (error) => {           // listener fails to initialize
        console.log("ERROR: " + JSON.stringify(error));
      }
      ).subscribe((nfcEvent) => {
        this.onWritableNfc(nfcEvent);
      });

      // listen for MIME media types of type 'text/hue' (for read or write)
      // Android calls the most specific listener, so text/hue tags end up here
      this.nfcProvider.addMimeTypeListener(this.app.mimeType, () => {
        console.log("listening for mime media tags");
      }, (error) => {
        console.log("ERROR: " + JSON.stringify(error));
      }).subscribe((nfcEvent) => {
        this.onMimeMediaNfc(nfcEvent);
      });
    }

    this.getSongs();                // load the drop-down menu with songs
  }

  display = (message) => {
    let textNode = document.createTextNode(message);
    let lineBreak = document.createElement("br");

    this.messageDiv.appendChild(lineBreak);
    this.messageDiv.appendChild(textNode);
  }

  clear = () => {
    this.messageDiv.innerHTML = "";
  }

  onPause = () => {
    if (this.app.musicState === this.mediaProvider.MEDIA_RUNNING) {
      this.pauseAudio();
    }
  }

  onResume = () => {
    if (this.app.musicState === this.mediaProvider.MEDIA_PAUSED) {
      this.startAudio();
    }
  }

  onWritableNfc = (nfcEvent) => {
    if (this.app.mode === "write") {
      this.makeMessage();  // in write mode, write to the tag
    }
  }

  onMimeMediaNfc = (nfcEvent) => {
    let tag = nfcEvent.tag;

    if (this.app.mode === "read") {   // in read mode, read the tag
      // when app is launched by scanning text/hue tag
      // you need to add a delay so the call to get the 
      // hub address can finish before you call the api.
      // if you have the address, delay 0, otherwise, delay 50:
      let timeout = this.hub.ipaddress ? 0 : 500;

      setTimeout(function () {
        this.readTag(tag);
      }, timeout);

    } else {               // if you're in write mode
      this.makeMessage();  // in write mode, write to the tag
    }
  }

  setMode = () => {
    if (this.app.mode === "write") {    // change to read mode
      this.app.mode = "read";
      this.tagModeMessage.innerHTML = "Tap a tag to read its settings.";
    } else {                       // change to write mode
      this.app.mode = "write";
      this.tagModeMessage.innerHTML = "Tap a tag to write current settings.";
    }
    this.modeValue.innerHTML = this.app.mode; // set text in the UI
  }

  findControllerAddress = () => {
    $.ajax({
      url: 'http://www.meethue.com/api/nupnp',
      dataType: 'json',
      success: (data) => {
        // expecting a list with a property called internalipaddress:
        if (data[0]) {
          this.hub.ipaddress = data[0].internalipaddress;
          this.getHueSettings();    // copy the Hue settings locally
        } else {
          this.nav.notification.alert(
            "Couldn't find a Hue on your network");
        }
      },
      error: (xhr, type) => {    // alert box with the error
        this.nav.notification.alert(xhr.responseText +
          " (" + xhr.status + ")", null, "Error");
      }
    });
  }

  ensureAuthorized = () => {
    let message;      // response from the hub

    // query the hub:
    $.ajax({
      type: 'GET',
      url: 'http://' + this.hub.ipaddress + '/api/' + this.hub.username,
      success: (data) => {      // successful reply from the hub
        if (data[0].error) {
          // if not authorized, users gets an alert box
          if (data[0].error.type === 1) {
            message = "Press link button on the hub.";
          } else {
            message = data[0].error.description;
          }
          this.nav.notification.alert(message,
            this.authorize, "Not Authorized");
        }
      },
      error: (xhr, type) => {    // error message from the hub
        this.nav.notification.alert(xhr.responseText +
          " (" + xhr.status + ")", null, "Error");
      }
    });
  }

  authorize = () => {
    let data = {                      // what you'll send to the hub:
      "devicetype": this.hub.appTitle,    // device type
      "username": this.hub.username       // username
    },
      message;                          // reply from the hub

    $.ajax({
      type: 'POST',
      url: 'http://' + this.hub.ipaddress + '/api',
      data: JSON.stringify(data),
      success: (data) => {       // successful reply from the hub
        if (data[0].error) {
          // if not authorized, users gets an alert box
          if (data[0].error.type === 101) {
            message = "Press link button on the hub, then tap OK.";
          } else {
            message = data[0].error.description;
          }
          this.nav.notification.alert(message,
            this.authorize, "Not Authorized");
        } else {                   // if authorized, give an alert box
          this.nav.notification.alert("Authorized user " +
            this.hub.username);
          this.getHueSettings();   // if authorized, get the settings
        }
      },
      error: (xhr, type) => {   // error reply from the hub
        this.nav.notification.alert(xhr.responseText +
          " (" + xhr.status + ")", null, "Error");
      }
    });
  }

  getHueSettings = () => {
    // query the hub and get its current settings:

    $.ajax({
      type: 'GET',
      url: 'http://' + this.hub.ipaddress + '/api/' + this.hub.username,
      success: (data) => {
        if (!data.lights) {
          // assume they need to authorize
          this.ensureAuthorized();
        } else {
          // the full settings take more than you want to
          // fit on a tag, so just get the settings you want:
          for (let thisLight in data.lights) {
            this.hub.lights[thisLight] = {};
            this.hub.lights[thisLight].name = data.lights[thisLight].name;
            this.hub.lights[thisLight].state = {};
            this.hub.lights[thisLight].state.on = data.lights[thisLight].state.on;
            this.hub.lights[thisLight].state.bri = data.lights[thisLight].state.bri;
            this.hub.lights[thisLight].state.hue = data.lights[thisLight].state.hue;
            this.hub.lights[thisLight].state.sat = data.lights[thisLight].state.sat;
          }
          this.setControls();
        }
      }
    });
  }

  putHueSettings = (settings: any, lightId?: any) => {
    // if no lightId is sent, assume the current light:
    if (!lightId) {
      lightId = this.hub.currentLight;
    }

    // if the light's not on, you can't set the other properties.
    // so delete the other properties before sending them.
    // if "on" is a property and it's false:
    if (settings.hasOwnProperty("on") && !settings.on) {
      // go through all the other properties:
      for (let prop in settings) {
        // if this property is not inherited:
        if (settings.hasOwnProperty(prop)
          && prop != "on") {      // and it's not the "on" property
          delete (settings[prop]); // delete it
        }
      }
    }

    // set the property for the light:
    $.ajax({
      type: 'PUT',
      url: 'http://' + this.hub.ipaddress + '/api/' + this.hub.username +
        '/lights/' + lightId + '/state',
      data: JSON.stringify(settings),
      success: (data) => {
        if (data[0].error) {
          this.nav.notification.alert(JSON.stringify(data),
            null, "API Error");
        }
      },
      error: (xhr, type) => {
        this.nav.notification.alert(xhr.responseText + " (" +
          xhr.status + ")", null, "Error");
      }
    });
  }

  setControls = () => {
    this.hub.currentLight = Number(this.lightNumber.value);

    // set the names of the lights in the dropdown menu:
    // (in a more fully developed app, you might generalize this)
    this.lightNumber.options[0].innerHTML = this.hub.lights["1"].name;
    this.lightNumber.options[1].innerHTML = this.hub.lights["2"].name;
    this.lightNumber.options[2].innerHTML = this.hub.lights["3"].name;

    // set the state of the controls with the current choice:
    let thisLight = this.hub.lights[this.hub.currentLight];
    this.hue.value = thisLight.state.hue;
    this.bri.value = thisLight.state.bri;
    this.sat.value = thisLight.state.sat;
    this.lightOn.checked = thisLight.state.on;
  }

  setBrightness = () => {
    // get the value from the UI control:
    let thisBrightness = parseInt(this.bri.value, 10);
    // get the property from hub object:
    let thisLight = this.hub.lights[this.hub.currentLight];
    // change the property in hub object:
    thisLight.state.bri = thisBrightness;
    // update Hue hub with the new value:
    this.putHueSettings({ "bri": thisBrightness });
  }

  setHue = () => {
    // get the value from the UI control:
    let thisHue = parseInt(this.hue.value, 10);
    // get the property from hub object:
    let thisLight = this.hub.lights[this.hub.currentLight];
    // change the property in hub object:
    thisLight.state.hue = thisHue;
    // update Hue hub with the new value:
    this.putHueSettings({ "hue": thisHue });
  }

  setSaturation = () => {
    // get the value from the UI control:
    let thisSaturation = parseInt(this.bri.value, 10);
    // get the property from hub object:
    let thisLight = this.hub.lights[this.hub.currentLight];
    // change the property in hub object:
    thisLight.state.sat = thisSaturation;
    // update Hue hub with the new value:
    this.putHueSettings({ "sat": thisSaturation });
  }

  setLightOn = () => {
    // get the value from the UI control:
    let thisOn = this.lightOn.checked;
    // get the property from hub object:
    let thisLight = this.hub.lights[this.hub.currentLight];
    // change the property in hub object:
    thisLight.state.on = thisOn;
    // update Hue hub with the new value:
    this.putHueSettings({ "on": thisOn });
  }

  setAllLights = (settings) => {
    for (let thisLight in settings) {
      this.putHueSettings(settings[thisLight].state, thisLight);
    }
  }

  getSongs = () => {
    this.fileProvider.resolveLocalFilesystemUrl(this.app.musicPath).then((directoryEntry: DirectoryEntry) => {
      let directoryReader = directoryEntry.createReader();
      directoryReader.readEntries((files) => {
        if (files.length > 0) {
          // clear existing songs
          this.songs.innerHTML = "";
        } else {
          this.nav.notification.alert(
            "Use `adb` to add songs to " + this.app.musicPath, {}, "No Music");
        }

        // once you have the list of files, put the valid ones in the selector:
        for (let i = 0; i < files.length; i++) {
          // if the filename is a valid file:
          if (files[i].isFile) {
            // create an option element:
            let option = document.createElement("option");
            // value = song's filepath:
            option.value = files[i].fullPath;
            // label = song name:
            option.innerHTML = files[i].name;
            // select the first one and add it to the selector:
            if (i === 0) { option.selected = true; }
            this.songs.appendChild(option);
          }
        }

        this.onSongChange();        // update the current song
      })
    });
  }

  onSongChange = (event?) => {
    let option: HTMLOptionElement = <HTMLOptionElement>this.songs[this.songs.selectedIndex];
    let uri = option.value;
    this.setSong(uri);
  }

  setSong = (uri) => {

    if (uri !== this.app.songUri) {
      this.stopAudio();            // stop whatever is playing
      this.songPlaying = null;     // clear the media object
      this.app.musicState = 0;         // clear the music state
      this.app.songUri = uri;          // saves the uri of the song
      // uses the filename for a title 
      this.app.songTitle = uri.substring(uri.lastIndexOf('/') + 1);
      $(this.songs).val(uri);          // ensure the UI matches selection
    }
  }

  toggleAudio = (event) => {
    switch (this.app.musicState) {
      case undefined:             // if playback is undefined
      case this.mediaProvider.MEDIA_NONE:      // or if no media playing
        this.startAudio();        // start playback
        break;
      case this.mediaProvider.MEDIA_STARTING:  // if media is starting
        // state = "music starting";// no real change
        break;
      case this.mediaProvider.MEDIA_RUNNING:   // if playback is running
        this.pauseAudio();        // pause it
        break;
      case this.mediaProvider.MEDIA_PAUSED:    // if playback is paused
      case this.mediaProvider.MEDIA_STOPPED:   // or stopped
        this.playAudio();         // resume playback
        break;
    }
  }

  startAudio = () => {
    // attempt to instantiate a song:
    if (this.songPlaying === null) {
      // Create Media object from songUri
      if (this.app.songUri) {

        this.songPlaying = this.mediaProvider.create(this.app.songUri, (success: any) => {
          console.log("Audio success");
        }, (error: MEDIA_ERROR) => {
          // Without timeout message is overwritten by "Currently Playing: ..."
          setTimeout(function () {
            this.display("Unable to play song.");
          }, 300);
        }, (status: MEDIA_STATUS) => {
          this.app.musicState = status;
        });

      } else {
        this.nav.notification.alert("Pick a song!");
      }
    }

    // play the song:
    this.playAudio();
  }

  playAudio = () => {
    if (this.songPlaying) {             // if there's current playback
      this.songPlaying.play();         // play
      this.playButton.innerHTML = "Pause"; // update the play/pause button

      // clear the message DIV and display song name and status:
      this.clear();
      this.display("Currently playing: " + this.app.songTitle);
    }
  }

  pauseAudio = () => {
    if (this.songPlaying) {             // if there's current playback
      this.songPlaying.pause();        // pause
      this.playButton.innerHTML = "Play";  // update the play/pause button

      // clear the message DIV and display song name and status:
      this.clear();
      this.display("Paused playing: " + this.app.songTitle);
    }
  }

  stopAudio = () => {
    if (this.songPlaying) {            // if there's current playback
      this.songPlaying.stop();         // stop
      this.playButton.innerHTML = "Play";  // update the play/pause button

      // clear the message DIV and display song name and status:
      this.clear();
      this.display("Stopped playing: " + this.app.songTitle);
    }
  }

  readTag = (thisTag) => {
    let message = thisTag.ndefMessage,
      record,
      recordType,
      content;

    for (let thisRecord in message) {
      // get the next record in the message array:
      record = message[thisRecord];
      // parse the record:
      recordType = this.nfcProvider.bytesToString(record.type);
      // if you've got a URI, use it to start a song:
      if (recordType === this.nfcProvider.bytesToString(this.nfcProvider.RTD_URI)) {

        content = this.nfcProvider.ndef.uriHelper.decodePayload(record.payload);

        this.fileProvider.resolveLocalFilesystemUrl(content).then(() => {
          this.setSong(content);
          this.startAudio();
        })
      }

      // if you've got a hue JSON object, set the lights:
      if (recordType === 'text/hue') {
        // tag should be TNF_MIME_MEDIA with a type 'text/hue'
        // assume you get a JSON object as the payload
        // JSON object should have valid settings info for the hue
        // http://developers.meethue.com/1_lightsapi.html

        content = this.nfcProvider.bytesToString(record.payload);
        content = JSON.parse(content);    // convert to JSON object

        this.setAllLights(content.lights); // use it to set lights
      }
    }
  }

  makeMessage = () => {
    let message = [];

    // put the record in the message array:
    if (this.hub.lights !== {}) {
      let huePayload = JSON.stringify({ "lights": this.hub.lights });
      let lightRecord = this.nfcProvider.mimeMediaRecord(this.app.mimeType, huePayload);
      message.push(lightRecord);
    }
    if (this.app.songUri !== null) {
      let songRecord = this.nfcProvider.uriRecord(this.app.songUri);
      message.push(songRecord);
    }

    //write the message:
    this.writeTag(message);
  }

  /*
     writes NDEF message @message to a tag:
  */
  writeTag = (message) => {
    // write the record to the tag:
    this.nfcProvider.write(message).then(() => {
      this.clear();
      this.display("Wrote data to tag.");
      this.nav.notification.vibrate(100);
    }).catch((reason) => {
      this.nav.notification.alert(reason,
        function () { }, "There was a problem");
    });
  }
}