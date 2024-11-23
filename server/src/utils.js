import TerminalService from "./services/TerminalService.js";

export const GetServerStartOptions = (gameVersion, type, predefSettings = {}) => {
    const config = {};
    var port = getFreePorts();

    if (gameVersion.game.name == "Minecraft") {

        config.port = port
        config.rport = Number(port) + 1
        config.rpassword = GenerateSixDigitNumber();
        if (type == "start")
            config.seed = predefSettings.seed || generateJavaSeed()
    }
    if (gameVersion.game.name == "Astroneer") {
        config.port = port
    }
    return config;
}
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const getFreePorts = () => {
    var port = 0;
    for (var i = 0; i < 10; i++) {
        port = getRandomNumber(49152, 65535);
        if (TerminalService.CheckPortOpen(port)) {
            break;
        } if (TerminalService.CheckPortOpen(Number(port) + 1)) {
            break;
        }
        port = 0
    }
    return port
}
function GenerateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}
function generateJavaSeed() {
    const min = BigInt('-9223372036854775808'); // -2^63
    const max = BigInt('9223372036854775807');  // 2^63 - 1

    // Generate random BigInt seed between min and max
    const seed = min + BigInt(Math.floor(Math.random() * Number(max - min + BigInt(1))));
    return seed.toString();
}
