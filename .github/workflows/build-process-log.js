const fs = require('fs')

const configFile = process.argv[2]
const logFile = process.argv[3]

const log = '\n' + fs.readFileSync(logFile, 'utf8') + '\n'

let newConfig = log.replace(/[\s\S]*\n\s*WARN: Config migration necessary(\n[ \t]+)"oldConfig": \{\1[\s\S]+?\1\},\1"newConfig": \{(\1[\s\S]+?)\1\}[\s\S]*/, '$2')
if (newConfig === log || !newConfig.trim().length) {
    process.exit(1)
}

if (false) {
    while (newConfig.startsWith('\n')) { newConfig = newConfig.substring(1) }
    while (newConfig.endsWith('\n')) { newConfig = newConfig.substring(0, newConfig.length - 1) }
    const newConfigPrefix = newConfig.replace(/^([ \t]+)[\s\S]+/, '$1')
    newConfig = '{\n' + newConfig.split('\n')
        .map(line => '  ' + line.substring(newConfigPrefix.length))
        .join('\n') + '\n}'
} else {
    newConfig = '{\n' + newConfig + '\n}'
    newConfig = JSON.stringify(JSON.parse(newConfig), null, 2)
}

console.log(`Migrating ${configFile}`)
fs.writeFileSync(configFile, newConfig + '\n', 'utf8')

