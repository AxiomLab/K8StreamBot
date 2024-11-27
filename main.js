onst mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { Movements, goals } = require('mineflayer-pathfinder');
const { GoalFollow } = goals;

let mainBot;
let currentFollowTarget = null;

// Function to create the main bot
function createMainBot() {
    mainBot = mineflayer.createBot({
        host: 'K8sMTRServer.****.**', // Server IP or hostname
        port: 25565, // Server port
        username: 'Ilovekidney_NET', // Bot's username
        version: '1.20.4', // Minecraft version
    });

    mainBot.loadPlugin(pathfinder);

    mainBot.once('spawn', () => {
        console.log('Main bot has spawned.');
        setTimeout(() => {
            mainBot.chat('/emotes play Wave');
        }, 5000);
    });

    mainBot.on('login', () => {
        console.log('Main bot logged in successfully.');
        mainBot.chat('Hi, I logged in, time to do susy stuff and then sell it!');
        // No default follow function
    });

    mainBot.on('chat', (username, message) => {
        console.log(`Chat message received from ${username}: ${message}`);
        handleChatCommand(mainBot, username, message);
    });

    mainBot.on('error', err => {
        console.error(`Error in main bot: ${err.message}`);
        console.error(err);
    });

    mainBot.on('end', () => {
        console.log('Main bot disconnected from the server.');
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            mainBot.connect();
        }, 10000); // Wait 10 seconds before attempting to reconnect
    });

    mainBot.on('kicked', (reason, loggedIn) => {
        console.error(`Main bot was kicked from the server. Reason: ${reason}. Logged in: ${loggedIn}`);
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            mainBot.connect();
        }, 10000); // Wait 10 seconds before attempting to reconnect
    });

    mainBot.on('death', () => {
        console.log('Main bot died.');
    });

    mainBot.on('health', () => {
        console.log(`Main bot health: ${mainBot.health}, food: ${mainBot.food}`);
    });

    mainBot.on('message', message => {
        console.log(`System message: ${message.toString()}`);
    });

    mainBot.on('physicTick', () => {
        // nothing here for the physic tick
    });
}

// Function to follow the player
function followPlayer(bot, username) {
    currentFollowTarget = username;
    const player = bot.players[username];
    if (!player || !player.entity) {
        bot.chat(`I can't find ${username}.`);
        return;
    }

    const mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot, mcData);
    movements.allowParkour = true; // Enable parkour to allow the bot to jump
    movements.canDig = true; // Enable digging to overcome obstacles

    bot.pathfinder.setMovements(movements);

    const followGoal = new GoalFollow(player.entity, 2); // Closer distance ensures tighter following
    bot.pathfinder.setGoal(followGoal, true);

    bot.chat(`I am now following ${username}.`);
    console.log(`The bot is now following the player: ${username}`);
}

// Function to handle chat commands
function handleChatCommand(bot, username, message) {
    const command = message.split(' ');

    if (command[0] === '!nickname' && command.length === 2) {
        const newNick = command[1];
        console.log(`New nickname command received: ${newNick}`);
        bot.chat(`Creating new bot: ${newNick}`);
        createTempBot(newNick); // Create a temporary bot with the specified nickname
    }

    if (command[0] === '!follow' && command.length === 2) {
        const targetPlayer = command[1];
        console.log(`!follow command received: The bot should follow ${targetPlayer}.`);
        followPlayer(bot, targetPlayer);
    }
}

// Function to create a temporary bot
function createTempBot(username) {
    const tempBot = mineflayer.createBot({
        host: 'K8sMTRServer.****.**', // Server IP or hostname
        port: 25565, // Server port
        username: username, // Temporary bot's username
        version: '1.20.4', // Minecraft version
    });

    tempBot.loadPlugin(pathfinder);

    tempBot.on('login', () => {
        console.log(`Temporary bot ${username} logged in successfully.`);
        setTimeout(() => {
            tempBot.chat('I will now leave the server.');
            tempBot.quit('Mission accomplished.');
        }, 10000); // Wait 10 seconds before the temporary bot leaves the server
    });

    tempBot.on('error', err => {
        console.error(`Error in temporary bot ${username}: ${err.message}`);
        console.error(err);
    });

    tempBot.on('end', () => {
        console.log(`Temporary bot ${username} left the server.`);
    });

    tempBot.on('kicked', (reason, loggedIn) => {
        console.error(`Temporary bot ${username} was kicked from the server. Reason: ${reason}. Logged in: ${loggedIn}`);
    });

    tempBot.on('death', () => {
        console.log(`Temporary bot ${username} died.`);
    });

    tempBot.on('health', () => {
        console.log(`Temporary bot ${username} health: ${tempBot.health}, food: ${tempBot.food}`);
    });

    tempBot.on('message', message => {
        console.log(`System message for temporary bot ${username}: ${message.toString()}`);
    });
}

// Initial start of the main bot
createMainBot();
