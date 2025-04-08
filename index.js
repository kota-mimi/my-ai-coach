async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userInput = event.message.text;
  const userId = event.source.userId;

  // 🔍 ログ出力でAPIキーの中身を確認！
  console.log('🚨 Authorization raw env:', process.env.DIFY_API_KEY);
  console.log('🚨 Authorization header being sent:', `Bearer 
${process.env.DIFY_API_KEY}`);

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

