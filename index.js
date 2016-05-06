#!/usr/bin/env node

'use strict'

const colors = require('colors/safe')
const inquirer = require('inquirer')
const execSync = require('child_process').execSync
const readFileSync = require('fs').readFileSync
const appendFileSync = require('fs').appendFileSync
const homedir = require('os').homedir

const run = command => execSync(command).toString("utf8").trim()
const getIndex = item => parseInt(item.split(";")[0])
const getCommand = item => item.split(";")[1]
const colorize = (item, search) => {
  const searchStart = item.indexOf(search)
  const searchEnd = searchStart + search.length
  return `${item.slice(0, searchStart)}${colors.red(search)}${item.slice(searchEnd)}`
}
const sendCommand = item => run(`tmux send-keys "${getCommand(item).replace(/"/g, '\\"')}"`)

const folder = run("pwd")
const history = readFileSync(`${homedir()}/.directory_history`, "utf8")
  .split("\n:")
  .map((item, index) => `${index};${item}`)

let directoryHistory = history
  .filter(item =>
    item.split(";")[2].split(";")[0] === folder
  )
  .map(item =>
    `${getIndex(item)};${item.split(";")[3].split("\u0000")[0]}`
  )

directoryHistory = directoryHistory.reverse().reduce((agg, item) => {
  const itemCommand = getCommand(item)
  if (!agg.met[itemCommand]) {
    agg.met[itemCommand] = true
    agg.result.push(item)
  }
  return agg
}, { met: {}, result: [] }).result.reverse()

const search = process.argv[2]
const commandIndex = parseInt(process.argv[2])
if (!isNaN(commandIndex)) {
  const requestedCommand = directoryHistory.find(item => getIndex(item) === commandIndex)
  sendCommand(requestedCommand)
}
else {
  const uniqueHistory = directoryHistory
    .slice(0, directoryHistory.length - 1)
    .filter(item => ~item.indexOf(search))
    .map(item => colorize(item, search))
  if (uniqueHistory.length === 0) {
    console.log("No matches.")
    process.exit(1)
  }
  inquirer.prompt([{
    type: "list",
    name: "commandIndex",
    message: "What command do you want? Here they are.",
    choices: uniqueHistory.map(item => ({ name: item, value: getIndex(item) })),

  }]).then(answers => {
    const commandIndex = answers.commandIndex
    const requestedCommand = directoryHistory.find(item => getIndex(item) === commandIndex)
    sendCommand(requestedCommand)
  })
}
