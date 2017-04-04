# Q.Mobile

A mobile app to enjoy interview questions from popular websites like:

* [careercup.com](https://careercup.com/page)
* [leetcode.com](https://leetcode.com/problemset/algorithms/)
* [lintcode.com](http://www.lintcode.com/en/problem/)

Inspired by [careercup-cli](https://github.com/skygragon/careercup-cli), and [leetcode-cli](https://github.com/skygragon/leetcode-cli).

## It's ...

A tool to utilize your fragmentation times to think those questions any time, any where.

## It's NOT ...

A tool to actually write code with.

## Features

* View interview questions on your mobile phone.
* Download all questions and saved locally.
* Customized `filters` to view questions by tags, companies, etc.
* Manage questions by tagging them as `Resolved`/`Favorite`/`Later`.
* One-click `update` to sync with the latest questions.
* Support `backup` and `restore` personal data to local file.

## Screenshots

<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/dashboard.png" width="275" /></kbd>
<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/question.png" width="275" /></kbd>
<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/setting.png" width="275" /></kbd>

## Install

Download the latest apps [here](https://github.com/skygragon/Q.mobile/releases).

For the time being those releases are for Android only.

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


