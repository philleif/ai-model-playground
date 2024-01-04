const fs = require('fs')
const { parser } = require('stream-json')
const { streamArray } = require('stream-json/streamers/StreamArray')
const fastcsv = require('fast-csv')

// Create a writable stream for the CSV file
const csvStream = fastcsv.format({ headers: true })
const writableStream = fs.createWriteStream('./tmp/LOCO-txt.csv')

csvStream.pipe(writableStream)

// Stream the JSON file
const jsonStream = fs
  .createReadStream('./tmp/LOCO.json')
  .pipe(parser())
  .pipe(streamArray())

jsonStream.on('data', (data) => {
  // Extract the "txt" field and write it to the CSV
  if (data.value && data.value.txt) {
    csvStream.write({ text: data.value.txt })
  }
})

jsonStream.on('end', () => {
  csvStream.end()
  console.log('CSV file has been written.')
})

jsonStream.on('error', (err) => {
  console.error('Stream error:', err)
})

writableStream.on('finish', () => {
  console.log('Done writing to CSV file.')
})
