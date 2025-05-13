const fs = require('fs')

const configFile = process.argv[2]
const logFile = process.argv[3]

const log = '\n' + fs.readFileSync(logFile, 'utf8') + '\n'

let newConfig = log.replace(/[\s\S]*\n\s*WARN: Config migration necessary(\n[ \t]+)"oldConfig": \{\1[\s\S]+?\1\},\1"newConfig": \{(\1[\s\S]+?)\1\}[\s\S]*/, '$2')
if (newConfig === log || !newConfig.trim().length) {
    process.exit(1)
}

const newConfigPrefix = newConfig.replace(/^\n+([ \t]+)[\s\S]+/, '$1')
console.log(`newConfigPrefix='${newConfigPrefix}'`)
newConfig = '{\n' + newConfig.split('\n')
    .map(line => line.substring(newConfigPrefix.length))
    .join('\n') + '\n}'

//newConfig = JSON.stringify(JSON.parse(newConfig), null, 2)
console.log(`newConfig:\n${newConfig}`)

console.log(`Migrating ${configFile}`)
fs.writeFileSync(configFile, newConfig + '\n', 'utf8')

