import md5 from "tinyhmacmd5";

/**
 * @typedef {{
 *   body: any,
 *   code: string,
 *   msg: string | null,
 *   status: number,
 * }} CCWResult
 * 
 * @typedef {Omit<Response, 'json'> & {
 *   json(): Promise<CCWResult>
 * }} CCWFetchResponse
 */

class CCWFetch {
    /**
     * 强制使用指定token。  
     */
    token = ''

    /** 
     * 是否允许使用 guest-id。  
     * 如果该值为 false，则在未登录时不会尝试使用 guest-id。  
     * 仅在 token 属性为空时有效。  
     */
    allowGuestId = true

    /**
     * [内部]  
     * 签名密钥。  
     * 使用 healthCheck 以更新签名密钥。  
     */
    _hmacKey = ''

    /**
     * [内部]  
     * 是否使用guest-id。  
     */
    _usingGuestId = false

    /**
     * [内部]  
     * guest-id。  
     * 使用 healthCheck 以生成 guest-id。
     */
    _guestId = ''

    /**
     * 更新签名密钥。  
     * 失败会抛出错误。  
     */
    async healthCheck(url = "https://community-web.ccw.site/health/check") {
        this._hmacKey = ''
        // 先尝试用token请求
        this._usingGuestId = false
        let response = await this.POST(url)
        if (response.status != 200) {
            throw Error(`CCWFetch healthCheck: HTTP ${response.status} ${response.statusText}`)
        }
        let result = await response.json()
        if (result.status != 200) {
            if (!this.token && this.allowGuestId) {
                // 未指定token，且未登录，尝试用guest-id请求。
                // 随机生成guest-id，反追踪。
                let hex = ''
                for (; hex.length < 32;)
                    hex += (0 | Math.random() * 16).toString(16);
                this._guestId = hex
                this._usingGuestId = true
                response = await this.POST(url)
                if (response.status != 200) {
                    throw Error(`CCWFetch healthCheck: HTTP ${response.status} ${response.statusText}`)
                }
                result = await response.json()
            }
            if (result.status != 200) {
                throw Error(`CCWFetch healthCheck: ${result.msg}`)
            }
        }
        /**
         * @type {{
         *   name: string,
         *   status: string,
         *   traceId: string,
         * }[]}
         */
        const body = result.body
        this._hmacKey = body.reduce((p, v) => v.traceId[parseInt(v.traceId[0], 16) + 1] + p, '')
    }

    /**
     * 请求 CCW API 。  
     * 如果有 body 但还没获取 hmacKey，会自动调用 healthCheck 函数。  
     * 
     * @param {string} method
     * @param {string | URL} url
     * @param {string | {[key: string]: any} | null} [body]
     * @param {RequestInit} [init]
     * @returns {Promise<CCWFetchResponse>}
     */
    async fetch(method, url, body, init) {
        init = (
            init == null
                ? {}
                : Object.assign({}, init)
        )
        init.method = method
        init.headers = new Headers(init.headers ?? {})

        init.headers.has("content-type") || init.headers.set("content-type", "application/json");

        if (this.token) {
            // token
            init.headers.set("token", this.token);
        } else if (this._usingGuestId && this.allowGuestId) {
            // guest
            init.headers.set("guest-id", this._guestId)
        } else {
            // user
            init.credentials ??= "include"
            if (navigator.userAgent.includes("gandi-desktop")) try {
                // gandi desktop
                //@ts-ignore
                const { token, userId } = electron.ipcRenderer.sendSync("auth:get-token");
                if (token)
                    init.headers.set("token", token);
            } catch (e) {
                console.error(e)
            }
        }

        if (body) {
            if (typeof body == 'object')
                body = JSON.stringify(body);
            init.body = body
            if (!this._hmacKey)
                await this.healthCheck();
            const b = "" + Date.now()
            init.headers.set("b", b)
            init.headers.set("a", md5("ccw" + body + b, this._hmacKey))
        }
        return fetch(url, init);
    }

    /**
     * @param {string} url
     * @param {string | {[key: string]: any} | null} [body]
     * @param {RequestInit} [init]
     */
    POST(url, body, init) {
        return this.fetch("POST", url, body, init)
    }

    /**
     * @param {string} url
     * @param {RequestInit} [init]
     */
    GET(url, init) {
        return this.fetch("GET", url, null, init)
    }
}

export default CCWFetch
