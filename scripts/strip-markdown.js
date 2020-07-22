const Filehound = require('filehound')
const removeMd = require('remove-markdown')
const fs = require('fs-extra')

const files = Filehound.create()
  .ext('md')
  .paths('../docs2')
  .discard('.node_modules')
  .find((err, mdFiles) => {
    if (err) return console.error('handle err', err)
  })

files.then(files => {
  files.map(file => {
    console.log(file)
    const content = fs.readFileSync(file, 'utf8')
    const plaintext = removeMd(content)
    const filename = file.replace('../docs2', './stripped-docs')
    fs.outputFileSync(filename, plaintext)
  })
})
