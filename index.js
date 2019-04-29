#!/bin/env node
if (process.argv.length < 3) {
  throw new Error('Specify a path')
}

const pathfs = require('path')
const fse = require('fs-extra')
const asar = require('asar')
const Promise = require('bluebird')

const srcPath = pathfs.resolve(process.argv.pop())
const srcAsarPathFile = pathfs.resolve(srcPath, 'resources', 'app.asar')
const srcAsarUnpackFile = pathfs.resolve(srcPath, 'resources', 'app.asar.unpacked')
const destAsarPathUnpackDirectory = pathfs.resolve(__dirname, 'asar_unpack')
const destAsarUnpackFile = pathfs.resolve(__dirname, 'app.asar.unpacked')
const destAsarFilePack = pathfs.resolve(__dirname, 'app.asar')

;(async _ => {
  const pathExist = await fse.exists(srcAsarPathFile)
  if (!pathExist) { throw new Error('Path seems to be wrong') }
  await prepareWorkspace()
  await copyAndExtract()
  await replace()
  await repack()
  await cleanWorkspace(destAsarPathUnpackDirectory, destAsarUnpackFile, destAsarFilePack)
})().catch(console.error)

async function repack() {
  await asar.createPackage(destAsarPathUnpackDirectory, destAsarFilePack)
  await fse.copy(destAsarFilePack, srcAsarPathFile)
}
async function replace() {
  const utilsPath = pathfs.resolve(destAsarPathUnpackDirectory, 'frontend' ,'utils', 'index.js')
  let utils = await fse.readFile(utilsPath, 'utf-8')
  utils = utils.replace(/noLicAndTrialExpires.*\}\}/, 'noLicAndTrialExpires: false}}')
  await fse.writeFile(utilsPath, utils, 'utf-8')
}
async function prepareWorkspace() {
  await cleanWorkspace(destAsarPathUnpackDirectory, destAsarUnpackFile, destAsarFilePack)
  await fse.mkdirp(destAsarPathUnpackDirectory)
}

async function copyAndExtract() {
  await fse.copy(srcAsarPathFile, destAsarFilePack)
  await fse.copy(srcAsarUnpackFile, destAsarUnpackFile)
  await asar.extractAll(destAsarFilePack, destAsarPathUnpackDirectory)
}
async function cleanWorkspace(...paths) {
  return Promise.map(paths, async path => {
    await fse.remove(path)
  })
}