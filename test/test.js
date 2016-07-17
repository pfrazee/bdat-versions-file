var tape = require('tape')
var bdatVersionsFile = require('..')

var now = Date.now()

var testFile = `
{"version":"1.0.0","change":1,"hash":"5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235","date":${now-1e6},"message":"a"}
{"version":"1.0.1","change":2,"hash":"5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235","date":${now-1e5}}
{"version":"1.1.0","change":3,"hash":"5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235","date":${now-1e4}}
{"change":4,"hash":"5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235","date":${now-1e3},"message":"b"}
{"version":"2.0.0","change":5,"hash":"5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235","date":${now-1e2},"message":"c"}
{"version":"3.3.3","change":6,"hash":"5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235","date":${now-1e1},"message":"d"}
`

var testLog = {
  "1.0.0": { "version": "1.0.0",   "change": 1, "hash": "5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235", "date": (now - 1e6), "message": "a" },
  "1.0.1": { "version": "1.0.1",   "change": 2, "hash": "5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235", "date": (now - 1e5), "message": undefined },
  "1.1.0": { "version": "1.1.0",   "change": 3, "hash": "5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235", "date": (now - 1e4),   "message": undefined },
  "c4":    { "version": undefined, "change": 4, "hash": "5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235", "date": (now - 1e3), "message": "b" },
  "2.0.0": { "version": "2.0.0",   "change": 5, "hash": "5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235", "date": (now - 1e2), "message": "c" },
  "3.3.3": { "version": "3.3.3",   "change": 6, "hash": "5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235", "date": (now - 1e1), "message": "d" }
}

tape('correctly parses', t => {
  bdatVersionsFile.parse(testFile, (err, vfile) => {
    if (err) throw err
    t.equal(vfile.current, '3.3.3', 'Correct latest version')
    t.deepEqual(vfile.index, ['1.0.0', '1.0.1', '1.1.0', 'c4', '2.0.0', '3.3.3'], 'Correct versions')
    t.deepEqual(vfile.log, testLog, 'Correct log')
    t.end()
  })
})

tape('correctly serializes', t => {
  var vfile = bdatVersionsFile.create()
  for (let id in testLog)
    vfile.append(testLog[id])
  t.equal(vfile.toString(), testFile.trim(), 'Correct serialization')
  t.end()
})

tape('append() correctly handles major, minor, patch, prerelease', t => {
  var vfile = bdatVersionsFile.create()
  vfile.append({ version: 'major', change: 1, hash: '5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235' })
  vfile.append({ version: 'minor', change: 2, hash: '5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235' })
  vfile.append({ version: 'patch', change: 3, hash: '5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235' })
  vfile.append({ version: 'prerelease', change: 4, hash: '5a58660814c5018613c5b90c668e94d24ad85f42507d62cea04542c251868235' })
  t.deepEqual(vfile.index, ['1.0.0', '1.1.0', '1.1.1', '1.1.2-0'], 'Version history is correct')
  t.end()
})