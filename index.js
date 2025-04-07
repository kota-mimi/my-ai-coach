require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const axios = require('axios');

const app = express();
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new Client(config);
app.use(express.json());

app.post('/webhook', middleware(config), async (req, res) => {
  const events = req.body.events;
  const results = await Promise.all(events.map(handleEvent));
  res.json(results);
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userInput = event.message.text;
  const userId = event.source.userId;

  // 🔍 Authorizationヘッダーをログに出力
  console.log('🚨 Authorization header being sent:', `Bearer 
${process.env.DIFY_API_KEY}`);

  const response = await 
axios.post('https://api.dify.ai/v1/chat-messages', {
    inputs: {},
    query: userInput
  }, {
    headers: {
      Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
      'Content-Type': 'application/json',
      'X-User-ID': userId
    }
  });

  const replyText = response.data.answer || 'AIからの返答がありません';

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('🚀 サーバー起動中（ポート3000）');
});

