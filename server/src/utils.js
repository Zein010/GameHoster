import TerminalService from "./services/TerminalService.js";

export const GetServerStartOptions = (gameVersion, type, predefSettings = {}) => {
    let config = {};
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
    if (gameVersion.game.name == "Rust") {
        config = {
            serverPort: 0, seed: 0, worldSize: 0, players: 0, serverName: "", serverDescription: 0, internalServerName: 0, rconPort: 0, rconPassword: 0
        }

        // Predef seed or a seend between 0 and 2147483647
        config.seed = predefSettings.seed ? predefSettings.seed : getRandomNumber(1, 2147483646)
        config.serverPort = predefSettings.port ? predefSettings.port : getFreePorts()
        config.rconPort = predefSettings.port ? getFreePorts() : (Number(config.serverPort) + 1)
        config.rconPassword = predefSettings.rconPassword ? predefSettings.rconPassword : getRandomNumber(100000, 999999)
        config.worldSize = predefSettings.worldSize ? predefSettings.worldSize : getRandomNumber(3500, 4500)
        config.players = predefSettings.players ? predefSettings.players : 50
        config.serverName = predefSettings.serverName ? predefSettings.serverName : "TestServer-" + getRandomNumber(100, 999);
        config.serverDescription = predefSettings.serverDescription ? predefSettings.serverDescription : "TestServerDescription-" + getRandomNumber(100, 999);
        config.internalServerName = predefSettings.internalServerName ? predefSettings.internalServerName : "internalServerName_" + getRandomNumber(100, 999);
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
