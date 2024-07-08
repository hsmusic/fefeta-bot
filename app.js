import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';

const app = express();
const PORT = process.env.PORT || 8772;

function ephemeral(res, message) {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      ...message,
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  });
}

app.use(express.json({
  verify: VerifyDiscordRequest(process.env.PUBLIC_KEY)
}));

app.post('/interactions', async function (req, res) {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'Add "HSMusicker" role') {
      const guild = req.body.guild_id;
      const user = data.target_id;
      const role = `749064508496019497`;

      const {roles} = data.resolved.members[data.target_id];
      const {username} = data.resolved.users[data.target_id];

      if (roles.includes(role)) {
        return ephemeral(res, {
          content: `They already have this role, hee-nyan-hee!`,
        });
      }

      try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${guild}/members/${user}/roles/${role}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          },
        });

        if (!res.status.toString().startsWith('2')) {
          throw new Error(`Bad response`, {cause: await res.json()});
        }
      } catch (error) {
        console.error(`Error adding role`);
        console.error(error);
        return ephemeral(res, {
          content: 'Oopsie! There was an internal error, sorry, blorb.',
        });
      }

      return ephemeral(res, {
        content: `I did it! You can go welcome ${username} now, meow! `,
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
