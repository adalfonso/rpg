# RPG

"Currently in development"

### Project Setup

This project uses [Tauri](https://github.com/tauri-apps/tauri). First must install required prerequisites as specified per your operating system [here](https://tauri.studio/docs/getting-started/prerequisites).

Then install project dependencies:

```bash
$ npm i
```

### Running the game

```bash
$ npm run tauri dev
```

### Unit tests

```bash
$ npm test
```

### Linting

```bash
$ npm run lint
```

### General check

The general check runs type-checking, linting, and unit tests. It is recommended to run this command as a final check before committing changes.

```bash
$ npm run check
```

### Building the game

```bash
$ npm run tauri build
```

This will produce an .exe, .msi, and other resources inside of the tauri-rpg folder.
