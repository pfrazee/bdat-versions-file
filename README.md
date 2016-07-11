# bdat-versions-file

This API parses, modifies, and serializes version history files for bdat archives.
Used by https://github.com/pfraze/bdat and https://github.com/pfraze/beaker, with the [dat network](https://github.com/maxogden/dat).

## Format

The file is a newline separated list, where each row takes the following form:

```
{semver} {change_num} {hex_hash}
```

Example file.
This represents an archive with a single file.
The version was bumped 4 times in a row, without changes to the archive.
The change number and hash refer to the feed state 1 entry prior to the "version commit."
Therefore, the block containing the "2.0.0" commit is block 5.

```
1.0.0 1 8648d0ba5cc6fecce82a95ae141a6af0a8b7a5aaf1e94a0204af54e8fe127c2b
1.0.1 2 18521e2d9483915c496a6f3772ee7297e770a7114901080c06bbafb57298e0b7
1.1.0 3 4d82539a292ec2c564abe7f8e8225f6b9b08c8169a7642438f46cfccff0cf060
2.0.0 4 40f978f34bee809b53b38611327ed2129ab3a41f081dc67d7b91c001a41415f8
```

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