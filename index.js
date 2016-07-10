var path = require('path')
var fs = require('fs')
var semver = require('semver')

module.exports.create = function () {
  return {
    append,
    toString,
    versions: [],
    current: false,
    log: {}
  }
}

module.exports.parse = function (str) {
  var match
  var vfile = module.exports.create()
  var regex = /^([^ ]+) ([\d]+) ([0-9a-z]+)$/gmi
  str = str.trim()
  while ((match = regex.exec(str))) {
    // extract values from row
    let [ _, version, change, hash ] = match

    // check the semver
    if (!semver.valid(version))
      return vfile // stop now

    // add entry
    vfile.versions.push(version)
    vfile.current = version
    vfile.log[version] = { change: +change, hash }
  }
  return vfile
}

function append (version, change, hash) {
  // validate
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
  if (typeof change != 'number')
    throw new Error('Invalid change number: '+change)
  if (this.current && change < this.log[this.current].change)
    throw new Error('New change number ('+change+') must be greater than current: '+this.log[this.current].change)

  // add entry
  this.versions.push(version)
  this.current = version
  this.log[version] = { change, hash }
}

function toString () {
  return this.versions.map(v => `${v} ${this.log[v].change} ${this.log[v].hash}`).join('\n')
}
