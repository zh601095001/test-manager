export default {
    ws_url: typeof window !== 'undefined' ? `ws://${location.host}/api/` : null,
    // ws_url: "ws://localhost:8080"
}