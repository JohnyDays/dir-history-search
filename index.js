#!/usr/bin/env node
const execSync = require('child_process').execSync
const readFileSync = require('fs').readFileSync
const appendFileSync = require('fs').appendFileSync
const homedir = require('os').homedir
const run = command => execSync(command).toString("utf8").trim()
const getIndex = item => parseInt(item.split(";")[0])
const folder = run("pwd")
const history = readFileSync(`${homedir()}/.directory_history`, "utf8")
  .split("\n:")
  .map((item, index) => `${index};${item}`)

const directoryHistory = history
  .filter(item =>
    item.split(";")[2].split(";")[0] === folder
  )
  .map(item =>
    `${getIndex(item)};${item.split(";")[3].split("\u0000")[0]}`
  )

const search = process.argv[2]
const commandIndex = parseInt(process.argv[2])
if (!isNaN(commandIndex)) {
  const requestedCommand = directoryHistory.find(item => getIndex(item) === commandIndex)
  run(`tmux send-keys ${requestedCommand.split(";")[1]}`)
}
else {
  directoryHistory
    .slice(0, directoryHistory.length - 1)
    .filter(item => ~item.indexOf(search))
    .map(item => console.log(item))
}
