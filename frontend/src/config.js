export default {
    ws_url: typeof window !== 'undefined' ? `ws://${location.host}/api/` : null,
    // ws_url: "ws://192.168.6.94:8888/api/"
}