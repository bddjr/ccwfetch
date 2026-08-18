import CCWFetch from "@bddjr/ccwfetch";

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
