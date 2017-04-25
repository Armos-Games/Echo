const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

const bot = new Discord.Client();

let commands = {};

const HasPermission = function (user, guild, permission) {
	if (permission == undefined)
		return true;
	for (let role of guild.roles)
	{
		if (role[1].name == permission)
		{
			for (let member of role[1].members)
			{
				if (member[1].id === user.id)
					return true;
			}
			return false;
		}
	}
	return false;
};

const CheckMessageForCommand = function (message) {
	let args = message.content.split(' ');
	let cmd = args.shift();
	if (message.guild == undefined)
	{
		message.reply("You can't send commands by direct message. Use a channel on a server.");
		return;
	}
	if (commands[cmd] != undefined)
	{
		if (HasPermission(message.author, message.guild, commands[cmd].permission))
		{
			commands[cmd].process(bot, message, args, config);
		}
		else
		{
			message.reply("You don't have permission to use the '" + cmd + "' command. You need to have the '" + commands[cmd].permission + "' role.");
		}
	}
};

//////////////////
//  LOAD CONFIG //
//////////////////
if (fs.existsSync("bot.config") == false)
{
	console.error("No config found. Please create a 'bot.config' file.");
	process.exit();
}
const config = JSON.parse(fs.readFileSync('bot.config', 'utf8'));

////////////////////
//  LOAD COMMANDS //
////////////////////
let src = require("./commands.js");
for (let cmd in src.commands)
{
	commands[cmd] = src.commands[cmd];
}

///////////
//  MAIN //
///////////
bot.on('ready', () => {
	console.log('Ready!');
});

bot.on("message", (message) => CheckMessageForCommand(message));
bot.on("messageUpdate", (oldMessage, newMessage) => {
	CheckMessageForCommand(newMessage);
});

bot.login(config.token);

//////////////
//   EXIT   //
//////////////
function exitHandler() {
	bot.destroy();
}
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);

////////////////////
//// TODO/FIXME ////
////////////////////
// * Iterate over Collections the right way.
// * Validate config file.
// * Catch errors