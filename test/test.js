var tape = require('tape')
var bdatVersionsFile = require('..')

var testFile = `
1.0.0 1 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
1.0.1 2 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
1.1.0 3 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
2.0.0 4 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
3.3.3 5 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
`

var testLog = {
  '1.0.0': { change: 1, hash: '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj' },
  '1.0.1': { change: 2, hash: '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj' },
  '1.1.0': { change: 3, hash: '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj' },
  '2.0.0': { change: 4, hash: '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj' },
  '3.3.3': { change: 5, hash: '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj' }
}

tape('correctly parses', t => {
  var vfile = bdatVersionsFile.parse(testFile)
  t.equal(vfile.current, '3.3.3', 'Correct latest version')
  t.deepEqual(vfile.versions, ['1.0.0', '1.0.1', '1.1.0', '2.0.0', '3.3.3'], 'Correct versions')
  t.deepEqual(vfile.log, testLog, 'Correct log')
  t.end()
})

tape('correctly serializes', t => {
  var vfile = bdatVersionsFile.create()
  for (let v in testLog)
    vfile.append(v, testLog[v].change, testLog[v].hash)
  t.equal(vfile.toString(), testFile.trim(), 'Correct serialization')
  t.end()
})

tape('append() correctly handles major, minor, patch, prerelease', t => {
  var vfile = bdatVersionsFile.create()
  vfile.append('major', 1, '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj')
  vfile.append('minor', 2, '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj')
  vfile.append('patch', 3, '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj')
  vfile.append('prerelease', 4, '2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj')
  t.deepEqual(vfile.versions, ['1.0.0', '1.1.0', '1.1.1', '1.1.2-0'], 'Version history is correct')
  t.end()
})