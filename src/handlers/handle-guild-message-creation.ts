import type { Message } from 'discord.js';
import { MessageType } from 'discord.js';

interface TweetInfo {
  mediaURLs: string[];
}

export const handleGuildMessageCreation = async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (message.type !== MessageType.Default) {
    return;
  }

  const twitterUrlRegex = /https?:\/\/(mobile\.)?twitter\.com\/(\w+)\/status\/(\d+)/g;
  const twitterUrls = message.content.match(twitterUrlRegex);

  if (twitterUrls === null) {
    return;
  }

  const tweetInfo = await fetch('https://api.vxtwitter.com/' + twitterUrls[0].split('/').pop());
  const tweetInfoJson = (await tweetInfo.json()) as unknown as TweetInfo;
  if (tweetInfoJson.mediaURLs.length) {
    return;
  }

  if (!tweetInfoJson.mediaURLs.map((url) => url.split('.').pop()).includes('mp4')) {
    return;
  }

  const newContent = message.content.replace(twitterUrlRegex, 'https://vxtwitter.com/$2/status/$3');
  const newMessage = [`<@${message.author.id}>`, newContent].join('\n');

  await message.channel.send(newMessage);
  await message.delete();
};
