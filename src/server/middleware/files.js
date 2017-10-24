const fs = require("fs")
const promisify = require('util').promisify
const glob = require('glob')

// const stat = promisify(fs.stat)
// const mkdir = promisify(fs.mkdir)
const copy = promisify(fs.copyFile)

let pGlob = promisify(glob.glob)

let timeStamp = () => {
    let d = new Date()
    let final =
    `${d.getFullYear()}_${d.getMonth()+1}_${d.getDate()}_${d.getHours()}_${d.getMinutes()}`
    return final
}
let time = timeStamp()

const dir = 'E:\\ORDENTRY'
const acctNum = "\\9987"

let acct = `${dir}${acctNum}`
let dbfiles = `${acct}\\DBFILES`
let backUp = `${dbfiles}\\BACKUP`
let dest = `${backUp}\\${time}`

let patterns = [
    'OE_FORM.*',
    // 'OE_SKIP.*',
    // 'OE_PKLST.*',
    // '*L*.*',
    // 'OE_GOTO.*',
    // 'ORDERS.*',
    // 'PT_AUTOA.*',
    // 'PT_AUTOB.*',
    // 'PT_OC*.*',
    // 'PT_CONTC.*',
    // 'CUSTOMER.*',
]

gO = {cwd: acct}


let exists = (f) => {
    try {
        const stats = fs.statSync(f)
        return true
    } catch (e) {
        return false
    }
}

let checkSubDir = (which) => {
    if (exists(which)) {
        console.log("dir exists: ", which)
        return true
    } else {
        try {
            fs.mkdirSync(which)
            console.log("made dir: ", which)
        } catch (e) {
            console.error('failed to create dir: ', which, e)
        }
    }
}

async function backupAcctFiles(source, dest, files) {
    for (let file of files) {
        try {
            await copy(`${source}\\${file}`, dest)
        } catch (e) {
            console.error("error copying file: ",source,file," to ",dest,e)
        }
    }
}

async function getGlobs(files, source, time, dest) {

    for (let file of files) {
        try {
            await pGlob(file, gO, (err, matches) => {
                backupAcctFiles(source, dest, matches)
            })
        } catch(e) {
            console.error(e)
        }
    }
}

Promise.resolve( checkSubDir(dbfiles) )
    .then( checkSubDir(backUp) )
    .then( checkSubDir(dest) )
    .then( getGlobs(patterns, acct, time, dest) )