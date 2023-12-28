const { targetPromptHandler } = require("./utils");

// create conversation
const createConversation = async () => {
  const res = await fetch("https://niansuh-gpt4api.hf.space/api/create", {
    method: "GET",
  });

  const resJson = await res.json();
  const headers = await res.headers;

  const result = {
    conversationId: resJson.conversationId,
    clientId: resJson.clientId,
    encryptedconversationsignature: resJson.encryptedconversationsignature,
    headers: headers,
  };

  return result;
};

// start conversation id
const startConversation = async (img, prompt) => {
  // terminal char
  const terminalChar = "";

  // create conversation id
  const { conversationId, clientId, encryptedconversationsignature, headers } =
    await createConversation();

  const generatePrompt = targetPromptHandler(prompt);

  const bodyRequest = {
    conversationId: conversationId,
    encryptedconversationsignature: encryptedconversationsignature,
    clientId: clientId,
    invocationId: 0,
    conversationStyle: "Balanced",
    prompt: generatePrompt,
    imageUrl: img,
    allowSearch: false,
    context: "",
  };

  const conv = await fetch("https://niansuh-gpt4api.hf.space/api/sydney", {
    method: "POST",
    body: JSON.stringify(bodyRequest),
    headers: {
      "content-type": "application/json",
    },
  });

  const resText = (await conv.text()).split(terminalChar);

  const messages = resText
    .map((object) => {
      try {
        return JSON.parse(object);
      } catch (error) {
        return object;
      }
    })
    .filter(Boolean);

  const result = {};

  const ChatResult = new Promise((resolve, reject) => {
    let isFulfilled = false;

    for (const message of messages) {
      if (message.type === 1) {
        const update = message;
        const msg = update.arguments[0].message?.[0];

        if (!msg) continue;

        if (!msg.messageType) {
          result.author = msg.author;
          result.text = msg.text;
          result.detail = msg;
        }
      } else if (message.type === 2) {
        const response = message;

        const validMessage = response.item.messages?.filter(
          (m) => !m.messageType
        );
        const lastMessage = validMessage?.[validMessage?.length - 1];

        if (lastMessage) {
          result.conversationId = response.item.conversationId;
          result.conversationExpiryTime = response.item.conversationExpiryTime;

          result.author = lastMessage.author;
          result.text = lastMessage.text;
          result.detail = lastMessage;

          if (!isFulfilled) {
            isFulfilled = true;
            resolve(result);
          }
        }
      } else if (message.type === 3) {
        if (!isFulfilled) {
          isFulfilled = true;
          resolve(result);
        }

        return;
      } else {
        //console.log("other message type");
      }
    }
  });

  return ChatResult;
};

module.exports = startConversation;
