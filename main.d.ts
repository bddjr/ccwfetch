export type CCWResult = {
    body: any;
    code: string;
    msg: string | null;
    status: number;
};
export type CCWFetchResponse = Omit<Response, 'json'> & {
    json(): Promise<CCWResult>;
};
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
declare class CCWFetch {
    /**
     * 强制使用指定token。
     */
    token: string;
    /**
     * 是否允许使用 guest-id。
     * 如果该值为 false，则在未登录时不会尝试使用 guest-id。
     * 仅在 token 属性为空时有效。
     */
    allowGuestId: boolean;
    /**
     * [内部]
     * 签名密钥。
     * 使用 healthCheck 以更新签名密钥。
     */
    _hmacKey: string;
    /**
     * [内部]
     * 是否使用guest-id。
     */
    _usingGuestId: boolean;
    /**
     * [内部]
     * guest-id。
     * 使用 healthCheck 以生成 guest-id。
     */
    _guestId: string;
    /**
     * 更新签名密钥。
     * 失败会抛出错误。
     */
    healthCheck(url?: string): Promise<void>;
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
    fetch(method: string, url: string | URL, body?: string | {
        [key: string]: any;
    } | null, init?: RequestInit): Promise<CCWFetchResponse>;
    /**
     * @param {string} url
     * @param {string | {[key: string]: any} | null} [body]
     * @param {RequestInit} [init]
     */
    POST(url: string, body?: string | {
        [key: string]: any;
    } | null, init?: RequestInit): Promise<CCWFetchResponse>;
    /**
     * @param {string} url
     * @param {RequestInit} [init]
     */
    GET(url: string, init?: RequestInit): Promise<CCWFetchResponse>;
}
export default CCWFetch;
