const fs = require('fs')
const { parser } = require('stream-json')
const { streamArray } = require('stream-json/streamers/StreamArray')

// Function to merge schema
function mergeSchema(existingSchema, newSchema) {
  for (const key in newSchema) {
    if (!existingSchema.hasOwnProperty(key)) {
      existingSchema[key] = newSchema[key]
    } else {
      if (
        typeof existingSchema[key] === 'object' &&
        typeof newSchema[key] === 'object'
      ) {
        mergeSchema(existingSchema[key], newSchema[key])
      }
    }
  }
}

// Function to extract schema from an array element
function extractSchemaFromArrayElement(element) {
  let schema = {}
  for (const key in element) {
    if (element.hasOwnProperty(key)) {
      schema[key] = typeof element[key]
      // For nested objects, initialize as an empty object
      if (
        schema[key] === 'object' &&
        element[key] !== null &&
        !Array.isArray(element[key])
      ) {
        schema[key] = {}
      }
    }
  }
  return schema
}

// Stream the JSON file
const jsonStream = fs
  .createReadStream('./tmp/LOCO.json')
  .pipe(parser())
  .pipe(streamArray())

let globalSchema = {}

jsonStream.on('data', (data) => {
  const localSchema = extractSchemaFromArrayElement(data.value)
  mergeSchema(globalSchema, localSchema)
})

jsonStream.on('end', () => {
  console.log('Extracted Schema:', JSON.stringify(globalSchema, null, 2))
})

jsonStream.on('error', (err) => {
  console.error('Stream error:', err)
})
