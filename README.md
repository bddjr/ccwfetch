# CCWFetch

用于请求 CCW API 。

使用 POST 方法携带 body 请求 `community-web.ccw.site` 的部分接口需要 A 和 B 请求头，否则可能会返回“网络错误”。

搞定 A 和 B 请求头之后，可以在携带用户 Cookie 或 Token 的环境里，以用户的身份向 CCW 发起任意网络请求。

该项目使用 [`tinyhmacmd5`](https://github.com/bddjr/tinyhmacmd5) 生成 A 请求头。

感谢 [@jexjws](https://github.com/jexjws) 使用 Gemini AI 找到重要线索，帮助作者破解请求头签名。

## 安装

### npm

```
npm i @bddjr/ccwfetch
```

```js
import CCWFetch from "@bddjr/ccwfetch";
```

### 其它包管理器

你也可以使用其它包管理器（例如 `pnpm` 或 `yarn`）代替 `npm` 。

### jsDelivr

详见 https://www.jsdelivr.com/package/npm/@bddjr/ccwfetch

```html
<script src="https://cdn.jsdelivr.net/npm/@bddjr/ccwfetch"></script>
```

它将使用 `var` 定义 `md5` 函数，然后定义 `class CCWFetch` 。

### 嵌入

你可以将 [`browser.min.js`](browser.min.js) 直接嵌入到你的脚本。

它将使用 `var` 定义 `md5` 函数，然后定义 `class CCWFetch` 。

---

## 使用

```js
const ccwfetch = new CCWFetch()

// 【可选】强制使用指定token
ccwfetch.token = 'XXXXXXXXXXXXXXXX5cfe55d5f1880737bf1237a9'

// 更新签名密钥。
// 失败会抛出错误。
await ccwfetch.healthCheck()

// POST
const response = await ccwfetch.POST(
    "https://community-web.ccw.site/students/list_sessions?page=1&perPage=20&sortField=createdAt&sortType=DESC",
    {
        "page": 1,
        "perPage": 20,
        "sortField": "createdAt"
    }
)

if (response.status != 200) {
    throw Error(`CCWFetch: HTTP ${response.status} ${response.statusText}`)
}

const result = await response.json()
if (result.status != 200) {
    throw Error(`CCWFetch: ${result.msg}`)
}

const body = result.body
console.log(JSON.stringify(body, null, 2))
```

---

## 技术细节

### 后端逻辑

HMAC-MD5 的密钥会在每次登录时生成一个，此后只要 Token 不变，密钥就不变。  

未登录时需要 `Guest-Id` 请求头，服务器会根据该请求头查找密钥，找不到就会生成一个新的密钥。

`Guest-Id` 请求头是哈希值，服务器不会校验，所以可以随机生成。

### 前端逻辑

携带 Cookie 使用 POST 方法请求以下地址

```
https://community-web.ccw.site/health/check
```

响应的 JSON 里通常是以下格式

```json
{
    "body": [
        {
            "name": "advertisement",
            "status": "DOWN",
            "traceId": "D69D698094AA414FAFB938F93D3E530E"
        },
        {
            "name": "article",
            "status": "UP",
            "traceId": "D2C4B6A1720E43bDA6CCD3962A140F57"
        },
        {
            "name": "auth",
            "status": "UP",
            "traceId": "4FCF2862DDAF495EAE369138338EF3F8"
        },
        {
            "name": "comment",
            "status": "UP",
            "traceId": "DA449A76EE50468886B4EC02CAA03C4D"
        },
        {
            "name": "notification",
            "status": "UP",
            "traceId": "DEDF7191DC7B47a58280125150B259F6"
        },
        {
            "name": "search",
            "status": "UP",
            "traceId": "74719B8B651F42FCB91532DCC19F98CD"
        },
        {
            "name": "user",
            "status": "UP",
            "traceId": "2A7e92ABB1C14A90BF6596ABD58B5E3C"
        },
        {
            "name": "websocket",
            "status": "UP",
            "traceId": "DB157973E06546c3AC8491C9E2FA5926"
        }
    ],
    "code": "200",
    "msg": null,
    "status": 200
}
```

使用特定逻辑提取 HMAC-MD5 的密钥

```js
let hmacKey = result.body.reduce((p, { traceId: v }) => v[parseInt(v[0], 16) + 1] + p, "")
```

然后在每次发起带有 body 的请求时，使用以下逻辑生成 A 和 B 请求头即可。

```js
const b = "" + Date.now()
const a = md5("ccw" + body + b, hmacKey)
```

---

## 许可证

该项目使用 [Unlicense](https://unlicense.org) 许可证，发布到公共领域。
