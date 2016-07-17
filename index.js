var path = require('path')
var fs = require('fs')
var semver = require('semver')
var JSONStream = require('json-stream')
var stringStream = require('string-to-stream')

module.exports.create = function () {
  return {
    append,
    toString,
    current: false, // the current semver, or false if not explicitly versioned
    index: [], // ordered list of IDs
    log: {} // log content
  }
}

module.exports.parse = function (str, cb) {
  stringStream(str).pipe(module.exports.fromStream(cb))
}

module.exports.fromStream = function (cb) {
  // only call the cb once
  // (I'm not sure if 'end' will fire after an 'error' on the stream. This safeguards against that possibility -prf)
  var called = false, _cb = cb
  cb = (...args) => {
    if (!called) {
      called = true
      _cb(...args)
    }
  }

  // return a stream that will parse the .json.log
  var stream = JSONStream()
  var vfile = module.exports.create() // <-- populated by the parse stream
  stream.on('data', entry => {
    // NOTE JSONStream guarantees that `entry` will be an object or array
    // if that's ever not true, this will throw
    var { version, change, hash, message, date } = entry

    // validation
    // change is required, and must be a number
    if (!change || (change != +change))
      return console.log('bad change')
    // hash is required, and must be a 64-digit hex string
    if (!hash || /[0-9a-f]{64}/.test(hash) == false)
      return console.log('bad hash')
    // version is optional, but must be a monotonic semver
    if (version && (!semver.valid(version) || (vfile.current && !semver.lt(vfile.current, version))))
      return console.log('bad version', !semver.valid(version), (vfile.current && !semver.gt(vfile.current, version)))

    // coerce types
    change = +change

    // add entry
    var id = getEntryId(entry)
    vfile.index.push(id)
    vfile.log[id] = { version, change, hash, message, date }
    if (version)
      vfile.current = version
  })
  stream.on('error', e => cb(e))
  stream.on('end', () => cb(null, vfile))

  return stream
}

// vfile obj methods
// =

function append (entry) {
  var { version, change, hash, date, message } = entry
  var last = getLast(this)
  var current = getCurrent(this)

  // defaults
  date = date || Date.now()

  // validate
  if (version) {
    if (['major', 'minor', 'patch', 'prerelease'].includes(version)) {
      version = semver.inc(this.current || '0.0.0', version)
    }
    else if (semver.valid(version)) {
      if (this.current && !semver.gt(version, this.current))
        throw new Error('New version ('+version+') must be greater than current: '+this.current)
    }
    else {
      throw new Error('Invalid semver: '+version)
    }
  }
  if (typeof change != 'number')
    throw new Error('Invalid change number: '+change)
  if (last && change < last.change)
    throw new Error('New change number ('+change+') must be greater than last: '+last.change)

  // add entry
  var id = getEntryId({ change, version })
  this.index.push(id)
  if (version)
    this.current = version
  this.log[id] = { version, change, hash, date, message }
}

function toString () {
  // newline-delimited json
  return this.index.map(id => JSON.stringify(this.log[id])).join('\n')
}

// internal helpers
// =

function getEntryId (entry) {
  return (entry.version) ? entry.version : ('c'+entry.change)
}

function getLast (vfile) {
  if (vfile.index.length > 0)
    return vfile.log[(vfile.index.length - 1)]
}

function getCurrent(vfile) {
  if (vfile.current)
    return vfile.log[vfile.current]
}