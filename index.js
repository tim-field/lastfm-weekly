require("dotenv").config()
const fetch = require("node-fetch")
const differenceInWeeks = require("date-fns/difference_in_weeks")
const addWeeks = require("date-fns/add_weeks")
const format = require("date-fns/format")

// const joel = "thom_dork"
// const stateDate = "2018-09-01"
const { API_KEY } = process.env

function getStats(user, from, to) {
  const timeFrom = convertToTimestamp(from)
  const timeTo = convertToTimestamp(to)
  return fetch(
    `http://ws.audioscrobbler.com/2.0/?method=user.getweeklyalbumchart&user=${user}&api_key=${API_KEY}&format=json&from=${timeFrom}&to=${timeTo}`
  ).then(res => res.json())
}

async function getAlbums(user, from, to) {
  let res = await getStats(user, from, to)
  return res.weeklyalbumchart.album
    .map(album => {
      return {
        name: album.name,
        count: parseInt(album.playcount, 10),
        week: niceDate(to)
      }
    })
    .filter(album => album.count > 1)
}

function niceDate(date) {
  return format(date, "YYYY-MM-DD")
}

function getTotalWeeks(from, to = new Date()) {
  return differenceInWeeks(to, from)
}

function convertToTimestamp(date) {
  return Math.floor(date.getTime() / 1000)
}

function eachWeek(since) {
  const totalWeeks = [...Array(getTotalWeeks(since)).keys()]
  const result = totalWeeks.map(weekNumber => {
    return addWeeks(since, weekNumber)
  })

  const pairs = result.map((weekDate, index) => {
    const nextIndex = index + 1
    var nextDate
    if (nextIndex == result.length) {
      nextDate = new Date()
    } else {
      nextDate = result[nextIndex]
    }
    return [weekDate, nextDate]
  })
  return pairs
}

async function getAllAlbums(user, since) {
  const weeks = await Promise.all(
    eachWeek(since).map(([from, to]) => {
      return getAlbums(user, from, to)
    })
  )
  return weeks.reduce((flat, week) => flat.concat(week), [])
}

function getRandomColor() {
  var letters = "0123456789ABCDEF"
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

async function getGraphData(user, startDate) {
  const allAlbums = await getAllAlbums(user, startDate)

  const weeks = allAlbums.reduce((weeks, album) => {
    if (weeks.includes(album.week)) {
      return weeks
    }
    return weeks.concat(album.week)
  }, [])

  const albumNames = allAlbums.reduce((names, album) => {
    if (names.includes(album.name)) {
      return names
    }
    return names.concat(album.name)
  }, [])

  const config = {
    type: "line",
    data: {
      labels: weeks,
      datasets: albumNames.map(name => {
        const albums = allAlbums.filter(album => album.name === name)
        const color = getRandomColor()
        return {
          label: name,
          fill: false,
          backgroundColor: color,
          borderColor: color,
          data: weeks.map(week => {
            const album = albums.find(album => album.week === week)
            return album ? album.count : 0
          })
        }
      })
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Chart with Multiline Labels"
      }
    }
  }
  return config
}

module.exports = {
  getGraphData,
  getStats,
  getAlbums
}
