import * as Discord from 'discord.js';
import dotenv from 'dotenv';
import Riichi, { Hairi, HairiReplace, RiichiResult } from 'riichi';
import { parseHandArgs } from './hand_parser';
import { translateHan, translateScore, translateYaku } from './translations';

class RiichiBot {
    bot: Discord.Client;

    command = '!riichi';
    avatar = 'https://iconarchive.com/icons/google/noto-emoji-activities/1024/52779-mahjong-red-dragon-icon.png';

    separator = '=';
    goodEmoji = '🀄';
    badEmoji = '💩';

    constructor(token: string) {
        this.bot = new Discord.Client();
        this.bot.on('ready', () => {
            console.log('Connected');
            console.log(`Logged in as: ${this.bot.user?.username} (${this.bot.user?.id})`);

            this.bot.user!.setActivity({
                name: this.command,
                type: 'LISTENING',
            });
            if (this.bot.user!.avatarURL() !== this.avatar) {
                this.bot.user!.setAvatar(this.avatar);
            }
        });
        this.bot.on('message', (message) => {
            if (message.author.bot) return;

            const args = message.content.split(/\s+/);
            if (message.channel.type === 'dm') {
                return this.handle(message, ...args);
            } else if (message.channel.type === 'text') {
                const [arg, ...values] = args;
                switch (arg) {
                    case this.command:
                    case `<@${this.bot.user?.id}>`:
                    case `<@!${this.bot.user?.id}>`: {
                        return this.handle(message, ...values);
                    }
                }
            }
        });
        this.bot.login(token);
    }

    handle = (message: Discord.Message, ...args: string[]) => {
        let arg: string = message.content;
        try {
            if (args[0].includes(this.separator) || args.length > 1) {
                arg = parseHandArgs(args, this.separator);
            } else {
                arg = args[0];
            }
            console.log(arg);

            const riichi = new Riichi(arg);
            const result = riichi.calc();
            console.log(result);
            if (result.error) {
                this.handleError(message, arg);
            } else if ('hairi' in result && result.hairi.now === 0) {
                this.handleHairi(message, arg, result.hairi);
            } else if ('hairi7and13' in result && result.hairi7and13.now === 0) {
                this.handleHairi(message, arg, result.hairi7and13);
            } else if (Object.keys(result.yaku).length === 0) {
                this.handleNoYakuError(message, arg);
            } else {
                this.handleScore(message, arg, result);
            }
        } catch (exception) {
            console.log(exception);

            this.handleError(message, arg);
        }
    }

    handleError = (message: Discord.Message, arg: string) => {
        message.channel.send([
            `Results For: ${arg}`,
            'Invalid Hand',
        ].join('\n'));
        message.react(this.badEmoji);
    }

    handleNoYakuError = (message: Discord.Message, arg: string) => {
        message.channel.send([
            `Results For: ${arg}`,
            'No Yaku',
        ].join('\n'));
        message.react(this.badEmoji);
    }

    handleHairi = (message: Discord.Message, arg: string, hairi: Hairi & HairiReplace) => {
        const { now, wait, ...replacements } = hairi;

        if (wait !== undefined) {
            message.channel.send([
                `Results For: ${arg}`,
                `Waits: ${Object.entries(wait).map(([tile, count]) => `${tile} (x${count})`).join(', ')}`
            ].join('\n'));
            message.react(this.goodEmoji);
        } else if (Object.keys(replacements).length > 0) {
            message.channel.send([
                `Results For: ${arg}`,
                'Invalid Hand. Replace:',
                ...Object.entries(replacements).map(([key, value]) => {
                    return `  •  ${key}: ${Object.entries(value).map(([tile, count]) => `${tile} (x${count})`).join(', ')}`;
                })
            ].join('\n'));
            message.react(this.goodEmoji);
        } else {
            this.handleError(message, arg);
        }
    }

    handleScore = (message: Discord.Message, arg: string, result: RiichiResult) => {
        message.channel.send([
            `Results For: ${arg}`,
            `${result.ten} ${translateScore(result.name)}`,
            `${result.oya.join(', ')} Dealer Win`,
            `${result.ko.join(', ')} Non-Dealer Win`,
            `${result.han} Han / ${result.fu} Fu`,
            'Yaku:',
            ...Object.entries(result.yaku)
                .sort(([_key1, value1], [_key2, value2]) => {
                    if (value1 > value2) {
                        return 1;
                    } else if (value1 < value2) {
                        return -1;
                    } else {
                        return 0;
                    }
                })
                .map(([key, value]) => `  •  ${translateHan(value.replace('飜', ' Han'))}: ${translateYaku(key)}`),
        ].join('\n'));
        message.react(this.goodEmoji);
    }
}

dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN;
if (token === undefined) throw Error('DISCORD_BOT_TOKEN not set!');

const riichiBot = new RiichiBot(token);