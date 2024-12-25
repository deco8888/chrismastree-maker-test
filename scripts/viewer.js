// scripts/move-viewer.js
const fs = require('fs')
const path = require('path')

const sourceFile = path.join(__dirname, '../public/viewer/dist/viewer.js')
const targetFile = path.join(__dirname, '../public/viewer/viewer.ts')

fs.copyFileSync(sourceFile, targetFile)