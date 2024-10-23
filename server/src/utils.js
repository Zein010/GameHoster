import TerminalService from "./services/TerminalService.js";

export const GetServerStartOptions = (gameVersion, predefSettings = {}) => {
    const config = {};
    var port = getFreePort();

    if (gameVersion.game.name == "Minecraft") {
        config.port = port
        config.seed = predefSettings.seed || generateJavaSeed()
    }
    return config;
}
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const getFreePort = () => {
    var port = 0;
    for (var i = 0; i < 10; i++) {
        port = getRandomNumber(49152, 65535);
        if (TerminalService.CheckPortOpen(port)) {
            break;
        }
        port = 0
    }
    return port
}
function generateJavaSeed() {
    const min = BigInt('-9223372036854775808'); // -2^63
    const max = BigInt('9223372036854775807');  // 2^63 - 1

    // Generate random BigInt seed between min and max
    const seed = min + BigInt(Math.floor(Math.random() * Number(max - min + BigInt(1))));
    return seed.toString();
}
