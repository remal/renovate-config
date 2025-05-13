const fs = require('fs')

const configFile = process.argv[2]
const logFile = process.argv[3]

const log = '\n' + fs.readFileSync(logFile, 'utf8') + '\n'

let newConfig = log.replace(/[\s\S]*\n\s*WARN: Config migration necessary(\n[ \t]+)"oldConfig": \{[\s\S]+?\1\},\1"newConfig": (\{[\s\S]+?\1\})[\s\S]*/, '$2')
if (newConfig === log) {
    process.exit(1)
}

newConfig = JSON.stringify(JSON.parse(newConfig), null, 2)

console.log(`Migrating ${configFile}`)
fs.writeFileSync(configFile, newConfig + '\n', 'utf8')

