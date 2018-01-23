# Q.Mobile

A mobile app to enjoy interview questions from popular websites like:

⦙  [leetcode.com](https://leetcode.com/problemset/algorithms/)
⦙  [lintcode.com](http://www.lintcode.com/en/problem/)
⦙  [careercup.com](https://careercup.com/page) ⦙

:bulb: *Inspired by [leetcode-cli](https://github.com/skygragon/leetcode-cli), and [careercup-cli](https://github.com/skygragon/careercup-cli).*

* A tool to utilize your fragmentation time to resolve questions any time, any where.
* **NOT** a tool to actually write code with!
* Browse interview questions on your mobile phone.
* Cache questions locally.
* `Filter` questions by tags, companies, etc.
* Manage questions with `Resolved`/`Favorite`/`Later` tags.
* Data `backup` and `restore` supported.

|App|Android|Questions Data File|
|:-:|:-----:|:-----------------:|
|![Q.leetcode](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.leetcode.64.png)<br/>Q.leetcode|![Q.leetcode](https://raw.githubusercontent.com/skygragon/Q.mobile/master/docs/Q.leetcode.apk.png)<br/>[1.4.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.4.0/Q.leetcode-1.4.0-android-1411150.apk)|![Q.leetcode](https://raw.githubusercontent.com/skygragon/Q.mobile/master/docs/Q.leetcode.json.png)<br/>[leetcode.json](https://github.com/skygragon/Q.mobile/releases/download/1.4.0/leetcode.json)<br/>685 questions by 2018-01-22|
|![Q.lintcode](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.lintcode.64.png)<br/>Q.lintcode|![Q.lintcode](https://raw.githubusercontent.com/skygragon/Q.mobile/master/docs/Q.lintcode.apk.png)<br/>[1.4.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.4.0/Q.lintcode-1.4.0-android-fa56b3e.apk)|![Q.lintcode](https://raw.githubusercontent.com/skygragon/Q.mobile/master/docs/Q.lintcode.json.png)<br/>[lintcode.json](https://github.com/skygragon/Q.mobile/releases/download/1.4.0/lintcode.json)<br/>382 questions by 2018-01-22
|![Q.careercup](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.careercup.64.png)<br/>Q.careercup|[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.careercup-1.3.0-android-1ee2d2c.apk)|[c3.json](https://github.com/skygragon/Q.mobile/releases/download/1.2.0/c3.json)<br/>16k+ questions by 2017-02-11|

## Screenshots

<img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/dashboard.png" width="275" /><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/question.png" width="275" /><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/setting.png" width="275" />

## Get Interview Questions

There are two ways to download questions:

### Live Download

* The 1st download will retrieve all the questions, while later downloads will retrieve new questions only since last download.
* Better to use free **WiFi**, especially for the 1st download.
* **DO NOT** use higher `Workers Concurrency` for leetcode (recommend **concurrency=`1`**), otherwise the server would block your ip due to too many requests in the same time!
* Consider use file restore if live download is too slow.

**HOWTO**

* Click `Check update from leetcode.com` button to start downloading from internet.


### File Restore

* Import the questions directly from local data file.
* **Be Careful!** You should only do this for the first time you use this app, because it will wipe and overwrite any existing data stored on your phone!

**HOWTO**

* Open app, find the filepath in `Setting`->`Backup/Restore`.
* Download data file (e.g. `leetcode.json`) and copy to the filepath on your phone.
* Click `restore` button to start restore.


## Advanced

* [Build from source code](https://github.com/skygragon/Q.mobile/blob/master/docs/build.md)


