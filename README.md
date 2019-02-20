# Nursepad

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

In the UK health care organisations who provide home drop-in services all use bespoke software solutions, these individual solutions can often cost each organisation phenomenal development and running costs; which given the current economic climate of health care in the UK this is not only inappropriate but dangerous.

A single application offering an all-round better service and usability than other solutions in the market; it will provide a system for synchronisation patient responsibilities and details with a home server, allowing the user to book a custom appointment with each patient. Once the user makes it to an appointment they are able to scan a barcode or QR code ID which is provided to each patient as part of industry standards, this clocks the user into the appointment and decrypts the patients persona details until they use the same system to cock out. This application will not be developed for a single organisation but provided equally to all, allowing for a new single unified solution and standard across the industry.

The application is full of features to create a superior service and solution, we grant access to several hardware components of the device; the camera to scan QR codes with the Anyline scanner API to clock the user in and out at appointments, the GPS for showing the patients location in relation to the user as well as giving programmatic access to the call function of the device allowing the user to call the patient from within the app. All this is implemented through the PhoneGap API, which allows us to quickly develop multi-platform applications using standard web technologies such as JavaScript, HTML and CSS.

### Installation

NursePad has been built using web technologies (HTML, CSS, JavaScript) on top of a platform Phonegap. Phonegap provides the necessary tools to package the web application and deploy it to multiple mobile platforms using the same code base.

The Phonegap CLI allows you to install the mobile application using a single command. Alternatively, a native Android project is created for you in the platforms directory ”/platforms/android” and it can be opened using Android Studio.

Installing the APK file on a device:
*  Connect Android device using a USB cable to your computer. Make sure USB debugging is switched on.
*  Open the terminal or Windows Command Line and execute :
```sh
$ adb devices
```
* Proceed if the device is detected. If no devices are detected, unplug the device and re-plug it. If the device is still not detected execute:
```sh
$ adb kill-server
$ adb start-server
```
*If the device is still not detected please seek help, ADB is notorious for its ”flakiness”.*
* Whilst still in the terminal or Windows Command Line, navigate to the folder in which the APK file resides, e.g.
```sh
$ cd /example/output
```
* Execute:
```sh
$ adb install apk-file-name
```

No setup required for NursePad. You will be provided with the details for a test account and you will simply need to login with these details. All patients will automatically be synced and the required information will be downloaded.

Test Account Details:
*email*: test@example.com 
*password*: test1!

### Test QR Codes

![Name: Peter](https://raw.githubusercontent.com/brandonhhardy/nursepad/master/assets/www/img/qr_id_0.png)

 
