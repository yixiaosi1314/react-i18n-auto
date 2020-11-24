import React from "react";
import { render } from "react-dom";
// 语言包要确保是最先加载
import en_US from "../locale/en_US/locale";
import localeUtils from "../locale/localeUtils";

localeUtils.locale(en_US);
export default class App extends React.Component {
  state = {};
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
