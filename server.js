require("dotenv").config()
const R = require("ramda")
const http = require("http")
const { parse } = require("url")
const querystring = require("querystring")
const { getGraphData } = require("./index")

const { port = 3001 } = process.env

const send = R.curry((type, status, response, data) => {
  response.writeHead(status, { "Content-Type": type })
  response.end(JSON.stringify(data))
  return response
})

const sendError = send("application/json", 500)
const sendGood = send("application/json", 200)

const server = http.createServer(async (request, response) => {
  const { method, url } = request
  console.log(method)
  if (method === "GET") {
    const { query } = parse(url)
    const { user, startDate } = querystring.parse(query)

    const validDate = Date.parse(startDate)
    if (isNaN(validDate)) {
      sendError(response, { error: "Invalid Date" })
    } else if (!user) {
      sendError(response, { error: "No User" })
    } else {
      console.log(user, startDate)

      response.writeHead(200, { "Content-Type": "application/json" })
      const data = await getGraphData(user, startDate)
      sendGood(response, data)
    }
  } else {
    response.statusCode = 404
    response.end()
  }
})

console.log(port)

server.listen(port)
