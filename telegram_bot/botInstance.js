// telegram_bot/index.js 
// Add these new commands to your bot:

// Add consent management
bot.onText(/\/consent (\+) (\w+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const phoneNumber = match[1];
  const source = match[2];
  
  if (msg.from.id != adminId) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to use this command."
    );
  }

  try {
    await updateConsent(phoneNumber, source, `Added by admin ${msg.from.id}`);
    bot.sendMessage(
      chatId,
      `✅ Consent recorded for ${phoneNumber} from ${source}`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    bot.sendMessage(
      chatId,
      `❌ Failed to record consent: ${error.message}`,
      { parse_mode: "HTML" }
    );
  }
});

// Add DNC management
bot.onText(/\/dnc (\+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const phoneNumber = match[1];
  
  if (msg.from.id != adminId) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to use this command."
    );
  }

  try {
    await addToDNC(phoneNumber);
    bot.sendMessage(
      chatId,
      `✅ ${phoneNumber} added to Do Not Call list`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    bot.sendMessage(
      chatId,
      `❌ Failed to add to DNC: ${error.message}`,
      { parse_mode: "HTML" }
    );
  }
});

// Update the inline keyboard
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to Customer Outreach Management!", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📞 Start Campaign", callback_data: "call" },
          { text: "📊 Check Contacts", callback_data: "count" },
        ],
        [
          { text: "🆔 Get Your ID", callback_data: "id" },
          { text: "✅ Permit User", callback_data: "permit" },
        ],
        [
          { text: "🚫 Unpermit User", callback_data: "unpermit" },
          { text: "📞 Assign Contact", callback_data: "line" },
        ],
        [
          {
            text: "📍 Set Notifications Channel",
            callback_data: "set_notifications",
          },
          {
            text: "📃 Set Campaign Type",
            callback_data: "set_agent",
          },
        ],
        [
          { text: "✅ Record Consent", callback_data: "record_consent" },
          { text: "🚫 Add to DNC", callback_data: "add_dnc" },
        ]
      ],
    },
  });
});