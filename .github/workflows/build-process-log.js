const fs = require('fs')

const logFile = process.argv[2]
const log = '\n' + fs.readFileSync(logFile, 'utf8') + '\n'

let newConfig = log.replaceFirst(/\n\s*WARN: Config migration necessary(\n[ \t]+)"oldConfig": \{[\s\S]+?\1\},\1"newConfig": (\{[\s\S]+?\1\})/, '$2')
if (newConfig === log) {
    process.exit(1)
}

newConfig = JSON.stringify(JSON.parse(newConfig), null, 2)
console.log(`Writing new config:\n  ${newConfig.replaceAll(/\n/, '\n  ')}`)

fs.writeFileSync(logFile, newConfig + '\n', encoding)

