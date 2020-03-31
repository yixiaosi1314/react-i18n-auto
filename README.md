
react-i18n-auto专门为中文国际化提供的自动化方案，快速迭代国际化开发，使用方法如下


#### 安装

推荐环境：babel7+,react16+

`npm install react-i18n-auto --save-dev`


#### 第一步：添加babel插件配置（.babelrc添加方式）
```
  {
    "plugins": [
      "@babel/plugin-transform-runtime",
      "react-i18n-auto",
      "..."
    ]
  }
```
#### 第二步：添加自动化配置 `i18n.config.js`

```
const generator = require('react-i18n-auto/generator')
const path = require('path')

generator.gen({

  excluded: /node_modules|output/, //排除文件选项（默认为：/node_modules/）

  src: path.resolve(__dirname, './code'), //源文件目录（必选）array|string

  outputPath: path.resolve(__dirname, './output'), //国际化配置输出目录（必选）
  

  // 生成本地化语言包（可选）
  translation: {
    en_US: {
      source: [ path.resolve(__dirname, './output/en_US/英文翻译.xlsx'), ...]   //翻译文件excel array|string
    }
    ...
  },


  // 非react16+，babel7+请自行配置babelrc，同时加入react-i18n-auto插件，配置方法同.babelrc，
  // 此配置项将使pluginOptions失效
  babelrc:{
     plugins:[
        ...
        ['react-i18n-auto',{...pluginOptions}]
     ]
  },
  
  // or
  babelrc: true, //使用当前项目.babelrc配置
  
  
  
  //针对react-i18n-auto插件配置项（默认配置）
  pluginOptions: {
  
    prefixKey: 'I_', // uuidKey 前缀
    $AI: '$AI', //全局方法$AI，参考localePolyfill.js

    // 排除不需要国际化配置的调用方法， $AI('key','value') key将取代自动生成的uuidKey，$$AI('value') 标记不翻译字符
    excludedCall: ['$AI', 'require', '$$AI', 'console.log', 'chalk.yellow'],

    excludedPattern: /\.\w+$/, // 排除不需要配置的字符串，默认文件名
  }
})

```
然后运行 `node  i18n.config.js` 自动生成配置文件

将`localePolyfill.js`，`localeUtils.js`，语言包文件自动生成到`outputPath`目录下

`localePolyfill.js`暴露全局方法 `$AI`, `$$AI`  和全局变量 `LOCALE` （语言包），`LOCALE_VERSION` （语言包版本）



#### 第三步：为每一个entry入口添加localePolyfill.js

```
// webpack.config.js
const path = require('path')
module.exports = {
  entry: {
    main: [
        path.resolve(__dirname, './output/localePolyfill.js'),
        path.resolve(__dirname, './src/index.js')
    ],
    ...
  },
```
#### 第四步：修改语言（中文无需加载语言包）

```
import React from 'react'
import en_US from '../output/en_US/locale'
import localeUtils from '../output/localeUtils'

localeUtils.locale(en_US)
```
```
// locale.js
module.exports = {
  'I_2gaaanh': 'Student',
  'I_2aq02r1': 'Teacher'
}
```

#### 第五步：唯一的额外的工作，动态加载语言包时（如果语言包已提前加载则无需此操作）
**修改前 **
```
// const.js
export default Const = {
  SelectOptions:[
    {
      name:'学生',
      value:'student',
    },
    {
      name:'教师',
      value:'teacher',
    },
  ]
}
```

```
// app.js
import React from 'react'
import Const from './const'

export default class App extends React.Comment {
  render () {
    return <select>
      {
        Const.selectOptions.map(item => {
          return <option key={item.value} value={item.value}>
             {item.name}
          </option>
        })
      }
    </select>
  }
}
```
由于const为常量，当语言包`LOCALE`更新时，const并不会得到更新，需要手动调用`$AI`，类似的情况都需要手动更新

**修改后**
```
import React from 'react'
import Const from './const'

export default class App extends React.Comment {
  render () {
    return <select>
      {
        Const.selectOptions.map(item => {
          return <option key={item.value} value={item.value}>
            {$AI(item.$_name, item.name)} {/*唯一需要修改的地方*/}
          </option>
        })
      }
    </select>
  }
}

```


```
// 编译后的const.js
// 所有的中文对应的字段，自动添加$_前缀，值为对应中文的uuidKey

export default Const = {
  SelectOptions: [{
    name: '学生',
    $_name: "I_2gaaanh",
    value: 'student'
  }, {
    name: '教师',
    $_name: "I_2aq02r1",
    value: 'teacher'
  }]
};

```
> ps ：通过代理getter，或提前加载语言包则可跳过步骤5，具体方法可自行尝试

#### 结束

* * *

编译前后代码对照，不污染源码，无痕开发

```
import React from 'react'
export default class App extends React.Comment {
  render () {
    return <div>
      <header>这是标题</header>
      <div title='这是提示文字'>
        <p>这是内容</p>
      </div>
      <footer>{this.state.title}</footer>
    </div>
  }
}
```
```
import React from 'react'
export default class App extends React.Comment {
  render () {
    return <div>
      <header>{$AI('I_5wtgbv1', '这是标题')}</header>
      <div title={$AI('I_7reuhi4', '这是提示文字')}>
        <p>{$AI('I_4ximl4b', '这是内容')}</p>
      </div>
      <footer>{this.state.title}</footer>
    </div>
  }
}
```




















