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
var vfilePath = __dirname + '.bdat/versions.json.log'
require('fs').readFileSync(vfilePath, 'utf-8')
  .pipe(require('bdat-versions-file').fromStream((err, vfile) => {
    // examine the log
    console.log(vfile.index) // => ['1.0.2', '1.0.1', '1.0.1']
    console.log(vfile.current) // => '1.0.2'
    console.log(vfile.log) /* => {
      '1.0.2': { version: '1.0.2', change: 54, hash: '...', date: 1468788049441, message: '...' },
      '1.0.1': { version: '1.0.1', change: 38, hash: '...', date: 1468788047173, message: '...' },
      '1.0.0': { version: '1.0.0', change: 12, hash: '...', date: 1468787947166, message: '...' }
    }*/

    // add a new version
    // (most recent change and hash should be retrieved from the containing hyperdrive)
    vfile.append({ version: '2.0.0', change: 71, hash: '...', message: 'Sprockets now come in blue' })
    // also supported:
    // vfile.append({ version: 'major', ... }) - bump major
    // vfile.append({ version: 'minor', ... }) - bump minor
    // vfile.append({ version: 'patch', ... }) - bump patch
    // vfile.append({ version: 'prerelease', ... }) - bump prerelease

    // write to disk
    require('fs').writeFileSync(vfilePath, vfile.toString(), 'utf-8')
  }))
```

## V2 Changes

Version 2.0.0 breaks fully from 1.0.0.
The encoding is switched from custom to JSON-stream, new log-fields are added, and the API is changed.

## API

### .parse(str, cb)

Parses the content of a JSON-stream-encoded string, and provides a `vfile` object.

### .fromStream(cb)

Parses the content of a JSON-stream-encoded stream, and provides a `vfile` object.
Returns a writable stream.

### .create()

Creates a new, empty `vfile` object.
The `vfile.current` value will be false.

### vfile.append({ version, change, hash, date, message })

Adds a new entry to the log.
 - `version` optional string. May be a valid semantic version, or one of `major`, `minor`, `patch`, `prerelease`. Throws if `version` is invalid.
 - `change` required number. The change-number of the most recent hyperdrive metadata block.
 - `hash` required hex-encoded string. The hash of the most recent hyperdrive metadata block.
 - `date` optional number, defaults to now.
 - `message` optional string.

### vfile.toString()

Serializes the vfile to a string.

### vfile.index

Ordered list of all entries in the file.

### vfile.current

The current semver.
If no semvers have been published, this will be false.

### vfile.log

A map of the semvers to change numbers and hashes.

```
vfile.log['1.0.0'] // => { version: String, change: Number, hash: String, date: Number, message: String }
```