# Basketball Number Generator

> **Note:** This readme was generated with the help of GitHub Copilot (GPT-4.1 AI).

## Overview
A web app for CLA basketball training; generating random basketball numbers, each optionally associated with a custom word or phrase, to promote quick decison making and facilate training this skill solo.
. Features include:
- Customizable number range
- Custom list of number/phrase pairs
- Text-to-speech (TTS) for numbers and/or phrases
- Color-based ball detection using the device camera
- Settings sidebar for all controls
- LocalStorage persistence

## Features
- **Random Number Generation:** Generate a random basketball number within a user-defined range.
- **Custom Number List:** Add, edit, and remove custom number/phrase pairs. The app can randomly select from this list.
- **Text-to-Speech:** Optionally speak the number, the phrase, or both, using the browser's TTS engine.
- **Color-Based Ball Detection:** Use your camera to detect a colored ball and trigger number generation hands-free.
- **Settings Sidebar:** All controls are accessible from a sidebar, including TTS options and camera toggle.
- **Persistence:** All settings and custom lists are saved in your browser.

## Usage
1. Open the app in your browser (desktop or mobile).
2. Set your desired number range and color tolerance.
3. Add custom number/phrase pairs if desired.
4. Use the camera to detect a ball, or (if enabled) click the Generate button.
5. Listen as the app speaks the number and/or phrase.

## Requirements
- Modern browser (Chrome, Firefox, Edge, or Safari)
- Camera access for color detection features
- Text-to-speech support (most browsers)

## Known Issues
- Some features may not work reliably on mobile browsers (see GitHub issues for details).
- TTS and camera access may require user interaction and permissions.

## Development
- Built with Next.js, React, and Tailwind CSS
- Color detection uses HTML5 video/canvas APIs
- No server or backend required

## License
MIT

---

*This README and project were generated and refined with the help of GitHub Copilot (GPT-4.1 AI).*
