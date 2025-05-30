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

// 🔧 middlewareとexpress.json()を両方入れる
app.post('/webhook', middleware(config), express.json(), async (req, res) => {
  const events = req.body.events;
  const results = await Promise.all(events.map(handleEvent));
  res.json(results);
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userInput = event.message.text;
  const userId = event.source.userId;

  // 🔍 デバッグログ
  console.log('💥 DIFY_API_KEY raw:', process.env.DIFY_API_KEY);
  console.log('💥 Authorization Header:', `Bearer ${process.env.DIFY_API_KEY}`);

  const response = await axios.post('https://api.dify.ai/v1/chat-messages', {
    inputs: { user_input: userInput },
    user: userId
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
  console.log(`🚀 サーバー起動中（ポート${port}）`);
});

