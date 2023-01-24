# Build
cd popup
npm i
npm run build
cd ..
npm i
npx web-ext run --devtools --start-url bing.ca