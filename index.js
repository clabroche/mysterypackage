#!/bin/env node
if (process.argv.length < 3) {
  throw new Error('Specify a path')
}

const pathfs = require('path')
const fse = require('fs-extra')
const asar = require('asar')
const PromiseB = require('bluebird')

const srcPath = pathfs.resolve(process.argv.pop())
const srcAsarPathFile = pathfs.resolve(srcPath, 'resources', 'app.asar')
const srcAsarUnpackFile = pathfs.resolve(srcPath, 'resources', 'app.asar.unpacked')
const destAsarPathUnpackDirectory = pathfs.resolve(__dirname, 'asar_unpack')
const destAsarUnpackFile = pathfs.resolve(__dirname, 'app.asar.unpacked')
const destAsarFilePack = pathfs.resolve(__dirname, 'app.asar')


  ; (async _ => {
    const pathExist = fse.existsSync(srcAsarPathFile)
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
  const utilsPath3 = pathfs.resolve(destAsarPathUnpackDirectory, 'shared', 'lmCore.js')
  let util = await fse.readFile(utilsPath3, 'utf-8')
  util = getBetween(util, 'leftdays:', ',', '1000')
  // util = getBetween(util, 'licensed:', ',', 'true')
  // util = getBetween(util, 'trialExpired:', ',', 'false')
  util = getBetween(util, 'isCommercialLic:', 'LicenseType.personal,', 'true', ',')
  util = getBetween(util, 'isCommercialLic:', '\\)],', 'true', ',')
  util = getBetween(util, 'isPersonalLic:', 'LicenseType.personal,', 'true', ',')
  util = getBetween(util, 'isPersonalLic:', '\\)],', 'true', ',')
  util = getBetween(util, 'noLicAndTrialExpires:', '}}', 'false')
  util += `exports.getLicInfo = function () {
  return {
    daysUsed: 0,
    from: "2020-05-24",
    isLicensed: true,
    licKey: undefined,
    licTo: 'coco',
    licType: 11111,
    status: 1,
    trialleftdays: 1000,
    trialLeftDays: 1000,
  }
}`
  await fse.writeFile(utilsPath3, util, 'utf-8')

  const utilsPath4 = pathfs.resolve(destAsarPathUnpackDirectory, 'shared', 'index.js')
  let util4 = await fse.readFile(utilsPath4, 'utf-8')
  util4 += `exports.getLicInfo = function() {return null};exports.licTrialExpired = function(){return false}`
  await fse.writeFile(utilsPath4, util4, 'utf-8')

  const utilsPath5 = pathfs.resolve(destAsarPathUnpackDirectory, 'frontend', 'utils', 'index.js')
  let util5 = await fse.readFile(utilsPath5, 'utf-8')
  util5 += `;exports.cl= function() {console.log('cl');return true}`
  await fse.writeFile(utilsPath5, util5, 'utf-8')

  const utilsPath6 = pathfs.resolve(destAsarPathUnpackDirectory, 'app.js')
  let util6 = await fse.readFile(utilsPath6, 'utf-8')
  util6 += `
;(_ => {
  setTimeout(() => {
    utils_1.ez.messager.show({ msg: "<h3>Enjoy your licence ;)</h3><div>it seems that a mysterious package is there for something</div>" })
    }, 100);
})()`
  await fse.writeFile(utilsPath6, util6, 'utf-8')

}
function getBetween(util, from, to, by, overrideTo) {
  const regex = new RegExp(from + '(.{1,400}?)' + to, 'gi')
  return util.replace(regex, from + by + (overrideTo === undefined ? to : overrideTo))
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
  return PromiseB.map(paths, async path => {
    await fse.remove(path)
  })
}

