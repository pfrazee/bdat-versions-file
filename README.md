# bdat-versions-file

Used by https://github.com/pfraze/bdat and https://github.com/pfraze/beaker, with the [dat network](https://github.com/maxogden/dat).

This API reads and writes a semver history for dat archives to a file.
By default, that filename is `.bdat-versions`.

The file is a newline separated list, where each row takes the following form:

```
{semver} {change_num} {hex_hash}
```

**TODO: put an example file here**

## Example usage

```js
// read and parse
var vfilePath = __dirname + '.bdat-versions'
var vfileData = require('fs').readFileSync(vfilePath, 'utf-8')
var vfile     = require('bdat-versions-file').parse(vfileData)

// examine the log
console.log(vfile.versions) // => ['1.0.2', '1.0.1', '1.0.1']
console.log(vfile.current) // => '1.0.2'
console.log(vfile.log) /* => {
  '1.0.2': { change: 54, hash: '...' },
  '1.0.1': { change: 38, hash: '...' },
  '1.0.0': { change: 12, hash: '...' }
}*/

// add a new version
vfile.append('2.0.0', newChangeNum, newHash)
// also supported:
// vfile.append('major', ...) - bump major
// vfile.append('minor', ...) - bump minor
// vfile.append('patch', ...) - bump patch
// vfile.append('prerelease', ...) - bump prerelease

// write to disk
var newVfileData = vfile.toString()
require('fs').writeFileSync(vfilePath, newVfileData, 'utf-8')
```

## API

### .parse(str)

Parses the string-content of a file, and returns a `vfile` object.
Returns an empty or partially-complete vfile if it finds parse errors.

### .create()

Creates a new, empty `vfile` object.
The `vfile.current` value will be false.

### vfile.append(version, changeNum, hash)

Adds a new entry to the log.
`version` may be a valid semantic version, or one of `major`, `minor`, `patch`, `prerelease`.
Throws if `version` is invalid.

### vfile.toString()

Serializes the vfile to a string.

### vfile.versions

Ordered list of all semvers in the file.

### vfile.current

The current semver.

### vfile.log

A map of the semvers to change numbers and hashes.

```
vfile.log['1.0.0'] // => { change: Number, hash: String }
```