# CCWFetch

用于请求 CCW API 。

## 开始

```
npm i @bddjr/ccwfetch
```

```js
import CCWFetch from "@bddjr/ccwfetch";

const ccwfetch = new CCWFetch()

// 更新签名密钥。
// 失败会抛出错误。
await ccwfetch.healthCheck()

// POST
const response = await ccwfetch.POST("https://community-web.ccw.site/search/hot_words", {
    length: 10
})
if (response.status != 200) {
    throw Error(`CCWFetch: HTTP ${response.status} ${response.statusText}`)
}

const result = await response.json()
if (result.status != 200) {
    throw Error(`CCWFetch: ${result.msg}`)
}

const body = result.body
console.log(body)
```
