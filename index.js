import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { Line } from "react-chartjs"
const worker = new Worker("./worker.js")

const loadData = (date, user) => {
  console.log(user, date)
  if (user && date) {
    worker.postMessage({ user, date })
  }
}

const LastFMWeekly = () => {
  const [date, setDate] = useState("")
  const [username, setUserName] = useState("")
  const [data, setData] = useState()
  useEffect(() => {
    worker.onmessage = ({ data }) => setData(data)
  })
  console.log(data)

  return (
    <div style={{ width: "90%" }}>
      <div>
        <div>
          <label>LastFM user name</label>
          <input
            type="text"
            value={username}
            onChange={({ target: { value } }) => setUserName(value)}
          />
        </div>
        <div>
          <label>Date From</label>
          <input
            type="date"
            value={date}
            onChange={({ target: { value } }) => setDate(value)}
          />
        </div>
        <button onClick={() => loadData(date, username)}>Graph</button>
      </div>
      {data && <Line {...data} />}
    </div>
  )
}

ReactDOM.render(<LastFMWeekly />, document.getElementById("root"))
