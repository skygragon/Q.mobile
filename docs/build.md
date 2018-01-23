This app is built on [ionic](http://ionicframework.com/) platform. In theory it could work on different mobile platforms, but for now we only deliver for Android.

# How to build

Be careful with the versions of the build tools (see below) you installed on your box, usually the latest `ionic` and `cordova` might have unexpected bugs...


|Tool   |Version|Install|
|-------|-------|-------|
|nodejs |latest |check this [guide](https://skygragon.github.io/leetcode-cli/install) for help|
|ionic  |3.19.1 |npm install -g ionic@3.19.1|
|cordova|7.1.0  |npm install -g cordova@7.1.0|

After installed, check followings before going forward.

```
$ node -v
$ npm -v
$ ioinc info
```

## Android

|Tool   |Version|Install|
|-------|-------|-------|
|Android SDK Tools|24.4.1|[Download](http://www.androiddevtools.cn/)|
|Android SDK|4.0 (android-14)|Use `sdkmanager` in Android SDK tools|

Build the apk:

```
$ git clone http://github.com/skygragon/Q.mobile
$ cd Q.mobile
$ git branch leetcode -t origin/leetcode && git checkout leetcode

$ ionic cordova platform add android
$ ionic cordova build android
```

# IOS

TBD
