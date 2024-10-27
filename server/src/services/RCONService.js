import Rcon from 'rcon';

const ConnectToServer = (rport, rpassword) => {

    const rcon = new Rcon("localhost", rport, "" + rpassword);

    // Handle successful connection
    rcon.on('auth', () => {

        // Send a message to all players
        rcon.send("say Hello from RCON!");

        // You can send any Minecraft server command
        rcon.send("time set night");
    });

    // Handle responses
    rcon.on('response', (str) => {
        console.log("Got response:", str);
    });

    // Handle errors
    rcon.on('error', (err) => {
        console.error("RCON error:", err);
    });

    // Handle end of connection
    rcon.on('end', () => {
        console.log("RCON connection closed!");
    });
    rcon.on("message", (message) => {
        console.log({ message })
    })
    // Connect to the server
    console.log("Connecting to RCON...");
    rcon.connect();

    // Example function to send commands

    // Example function to safely disconnect
    function disconnect() {
        if (rcon.authenticated) {
            rcon.disconnect();
        }
    }

    // Clean up on process exit
    process.on('SIGINT', () => {
        console.log("Closing RCON connection...");
        disconnect();
        process.exit()
    });
}
const RCONService = { ConnectToServer };
export default RCONService