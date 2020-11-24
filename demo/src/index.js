import React from "react";
import { render } from "react-dom";
export default class App extends React.Component {
  render() {
    return (
      <div>
        <header>这是标题</header>
        <div title="这是提示文字">
          <p>这是内容</p>
        </div>
        <footer>{this.state.title}</footer>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
