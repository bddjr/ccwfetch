import fs from 'node:fs'
import { fileURLToPath } from 'node:url';
import { minify_sync } from "terser";

const tinyhmacmd5 = fs.readFileSync(fileURLToPath(import.meta.resolve('tinyhmacmd5/browser.min.js'))).toString()

let mainjs = fs.readFileSync('main.js').toString()
    .replace(/import md5 from .+/, '')
    .replace(/export default .+/, '')

let result = minify_sync(mainjs, {
    format: {
        wrap_iife: false
    }
})

let out = `${tinyhmacmd5}

${result.code}`

fs.writeFileSync('browser.min.js', out)
