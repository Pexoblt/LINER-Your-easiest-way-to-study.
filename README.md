# LINER-Your-easiest-way-to-study.

**Your easiest way to study.**

LINER is a Windows desktop study companion with a focus timer and a personal calendar. Its interface can be switched between **Romanian and English** from the language selector inside the app.

## Features

- Focus timer with adjustable session length (5–120 minutes).
- Personal calendar with events such as tests, oral tests, homework and projects.
- Liquid Glass-inspired interface and customizable background/progress colors.
- Romanian 🇷🇴 and English 🇬🇧 interface; the selected language is remembered.
- Local persistence for timer preferences, calendar events and language choice.
- Windows notification for the nearest upcoming event marked **Test**, shown in the selected language.
- Optional automatic launch when the installed app starts with Windows; this can be controlled in Windows Startup settings.

## Requirements

- Windows x64 to build the installer.
- Node.js 22.12.0 or newer and npm.
- Internet access for the first dependency installation.


## How to install

Run the integrated setup installer
```

The installer is generated in `dist/` as `LINER-Setup-1.1.1.exe`.

## First-launch setup

On the first launch, LINER shows a short animated welcome flow where you choose Romanian or English first, enter your name, and then enter your age. These preferences are stored locally on the device in the app profile. The setup is shown only once; the selected language can still be changed from the language selector in the app.



## Local data and privacy

Timer settings, calendar entries and language preference are stored locally in the app's persistent Electron profile. They are not synced to a cloud account. Browser events from a separate `file://` or `localhost` copy are not automatically imported into the desktop app. Back up important events before switching versions.

## Credits

**Created by pexoblt & ASTER.**
