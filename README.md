# Build
cd popup
npm i
npm run build
cd ..
npm i
npx web-ext run --devtools --start-url bing.ca

# Inner loop
In a terminal
```
cd popup
npm run nodemon
```
Run this task
```
// Place your key bindings in this file to override the defaults
[
    {
        "key": "alt+b",
        "command": "workbench.action.tasks.runTask",
        "args": "Run"
    },
]
```

# Build xpi
```
npx web-ext build
```
or
```
zip -r -FS ../ext.zip * --exclude '*.git*'
```