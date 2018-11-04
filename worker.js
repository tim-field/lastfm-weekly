import { getGraphData } from "./lastfm"

self.onmessage = e => {
  const { user, date } = e.data
  getGraphData(user, date).then(data => {
    self.postMessage(data)
  })
}
