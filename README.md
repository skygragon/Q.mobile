# Q.Mobile

A mobile app to enjoy interview questions from popular websites like:

⦙  [careercup.com](https://careercup.com/page)
⦙  [leetcode.com](https://leetcode.com/problemset/algorithms/)
⦙  [lintcode.com](http://www.lintcode.com/en/problem/) ⦙ 

:bulb: *Inspired by [careercup-cli](https://github.com/skygragon/careercup-cli), and [leetcode-cli](https://github.com/skygragon/leetcode-cli).*

* A tool to utilize your fragmentation times to think those questions any time, any where.
* **NOT** a tool to actually write code with!
* View interview questions on your mobile phone.
* Download all questions and saved locally.
* Customized `filters` to view questions by tags, companies, etc.
* Manage questions by tagging them as `Resolved`/`Favorite`/`Later`.
* One-click `update` to sync with the latest questions.
* Support `backup` and `restore` personal progress to local file.

## Screenshots

<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/dashboard.png" width="275" /></kbd>
<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/question.png" width="275" /></kbd>
<kbd><img src="https://github.com/skygragon/Q.mobile/blob/master/screenshots/setting.png" width="275" /></kbd>

## Installations

For the time being those releases are for Android only.

|App|Name    |Android|Questions File|#Questions|Last Updated|
|---|--------|-------|:------------:|:--------:|:----------:|
|![Q.leetcode](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.leetcode.64.png)|Q.leetcode |[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.leetcode-1.3.0-android-3fdc208.apk) |[leetcode.json](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/leetcode.json)|523 |2017-05-05|
|![Q.lintcode](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.lintcode.64.png)|Q.lintcode |[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.lintcode-1.3.0-android-08a7dfa.apk) |[lintcode.json](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/lintcode.json)|296 |2017-05-05|
|![Q.careercup](https://github.com/skygragon/Q.mobile/raw/master/screenshots/Q.careercup.64.png)|Q.careercup|[1.3.0.apk](https://github.com/skygragon/Q.mobile/releases/download/1.3.0/Q.careercup-1.3.0-android-1ee2d2c.apk)|[c3.json](https://github.com/skygragon/Q.mobile/releases/download/1.2.0/c3.json)|16k+|2017-02-11|

## Fetch Questions HOWTO

There are two ways to fetch questions in the app: download via WIFI, or restore from file. Let's take `Q.leetcode` for example.

**Download via WIFI**

* Click `Check update from leetcode.com` button in dashboard page, that's all!
* For the 1st time it will download all the questions form website, while later syncs will only try to download those new questions since last sync.

:exclamation:NOTE:exclamation:
* :exclamation: PLEASE make sure your phone is using WiFi networking!
* :exclamation: If WIFI is too slow, try restore from file instead (only for the 1st time sync!!)

**Restore from File**

* Download questions file `leetcode.json` listed above.
* Copy to the right path on the phone, thus Q.leetcode could find it.
  * check `Setting` page, you can find the right path under `Backup/Restore` section.
* Click `restore` button and wait for completion.

:exclamation:NOTE:exclamation:
* :exclamation: `restore` operation is dangerous! It will fully wipe existing questions saved on the phone, make sure you understand what you are doing before kickoff!
* :exclamation: It's a good practice to regularly `backup` to the local file and copy it otherwhere.
* :exclamation: Always `backup` before `restore`.

## Advanced Topics

* [Build from source code](https://github.com/skygragon/Q.mobile/blob/master/docs/build.md)


