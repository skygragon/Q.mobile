# Q.Mobile

A mobile app to enjoy interview questions from popular websites like:

⦙  [careercup.com](https://careercup.com/page)
⦙  [leetcode.com](https://leetcode.com/problemset/algorithms/)
⦙  [lintcode.com](http://www.lintcode.com/en/problem/) ⦙ 

*Inspired by [careercup-cli](https://github.com/skygragon/careercup-cli), and [leetcode-cli](https://github.com/skygragon/leetcode-cli).*

## It is ...

A tool to utilize your fragmentation times to think those questions any time, any where.

## It's NOT ...

A tool to actually write code with.

## Features

* View interview questions on your mobile phone.
* Download all questions and saved locally.
* Customized `filters` to view questions by tags, companies, etc.
* Manage questions by tagging them as `Resolved`/`Favorite`/`Later`.
* One-click `update` to sync with the latest questions.
* Support `backup` and `restore` personal progress to local file.

## Installations

For the time being those releases are for Android only.

|App|Name    |Android|Questions File|
|---|--------|-------|--------------|
|![Q.leetcode](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.leetcode.64.png)|Q.leetcode |[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.leetcode-1.3.0-android-3fdc208.apk) |[leetcode.json](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/leetcode.json) ⦙ 523 questions ⦙ @2017-05-05|
|![Q.lintcode](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.lintcode.64.png)|Q.lintcode |[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.lintcode-1.3.0-android-08a7dfa.apk) |[lintcode.json](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/lintcode.json) ⦙ 296 questions ⦙ @2017-05-05|
|![Q.careercup](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.careercup.64.png)|Q.careercup|[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.careercup-1.3.0-android-1ee2d2c.apk)|[c3.json](https://github.com/skygragon/Q.mobile/releases/download/1.2.0/c3.json) ⦙ 16k+ questions ⦙ @2017-02-11)|

## Screenshots

<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/dashboard.png" width="275" /></kbd>
<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/question.png" width="275" /></kbd>
<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/setting.png" width="275" /></kbd>

## About Questions Update

### Use WIFI for the 1st Run

For the 1st time you need download all the questions form those websites, which might be a lot of data to download (e.g. careercup.com has more than 16k+ questions!)

**So for the first download, PLEASE make sure your phone is using WiFi network!!**

(P.S. Later updates will only download those new questions since last update)

### Or, import from local file

If this fresh updating progress cost too much time, you can instead import the questions directly from local storage.

e.g. for Q.careercup, you can:

1. download the latest `c3.json` file from [here](https://github.com/skygragon/Q.mobile/releases).
2. copy to the phone in the right folder, see `Setting`->`Backup/Restore` in the app to get the path.
3. choose restore and wait for completion.

Please note that this `restore` operation will wipe existing questions saved in the app, so be careful to not lose your data by mistake in future use. Also note that it's always a good practice to regularly `backup` the questions to local file for disaster recover.

## Advanced Topics

* [Build from source code](https://github.com/skygragon/Q.mobile/blob/master/docs/build.md)


