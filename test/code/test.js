import React from 'react'
import Const from './const'

export default class App extends React.Component {
  render () {
    return <select>
      {
        Const.SelectOptions.map(item => {
          return <option key={item.value} value={item.value}>
            {item.name}
          </option>
        })
      }
    </select>
  }
}