import dotenv from 'dotenv';
import RiichiBot from './bot';

dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN;
if (token === undefined) throw Error('DISCORD_BOT_TOKEN not set!');

new RiichiBot(token);