// asterisk/call.js 
const { get_bot } = require("../telegram_bot/botInstance");
const { add_entry_to_memory, pop_unprocessed_line } = require("../utils/entries");
const { sanitize_phoneNumber } = require("../utils/sanitization");
const { get_settings } = require("../utils/settings");
const { ami } = require("./instance");
const { verifyConsent, addToDNC, checkContactFrequency } = require("../utils/consentManager");

let hasLoggedAllContacts = false;

module.exports = async (entry) => {
  if (!entry) {
    if (!hasLoggedAllContacts) {
      const bot = get_bot();
      const settings = get_settings();
      
      bot.sendMessage(
        settings?.notifications_chat_id,
        `✅ All contacts have been processed`,
        { parse_mode: "HTML" }
      );
      hasLoggedAllContacts = true;
    }
    return;
  }

  const number = sanitize_phoneNumber(entry?.phoneNumber);
  const settings = get_settings();

  // Verify consent before calling
  const hasConsent = await verifyConsent(number);
  if (!hasConsent) {
    console.log(`No consent for ${number}, skipping`);
    require("./call")(pop_unprocessed_line());
    return;
  }

  // Check if number is on DNC list
  const dncRecord = await Contact.findOne({ phoneNumber: number, dnc: true });
  if (dncRecord) {
    console.log(`${number} is on DNC list, skipping`);
    require("./call")(pop_unprocessed_line());
    return;
  }

  // Check contact frequency
  const contactCount = await checkContactFrequency(number);
  if (contactCount > MAX_CONTACTS_PER_MONTH) {
    console.log(`Contact limit reached for ${number}, skipping`);
    require("./call")(pop_unprocessed_line());
    return;
  }

  add_entry_to_memory({ ...entry, phoneNumber: number });

  const actionId = `call-${number}-${Date.now()}`;

  console.log(`Initiating contact with ${number}`);

  ami.action(
    {
      action: "Originate",
      channel: `SIP/main/${number}`,
      context: `outbound-${settings?.agent || "customer_service"}`,
      exten: number,
      priority: 1,
      actionid: actionId,
      CallerID: number,
      async: true,
    },
    (err, res) => {
      if (err) {
        console.error("Originate Error:", err);
        require("./call")(pop_unprocessed_line());
      } else {
        console.log("Originate Response:", res);
        
        // Log the call attempt
        Contact.findOneAndUpdate(
          { phoneNumber: number },
          {
            $push: {
              contactHistory: {
                timestamp: new Date(),
                agent: settings?.agent || "customer_service",
                outcome: "attempted"
              }
            },
            $inc: { contactFrequency: 1 },
            lastContact: new Date()
          }
        ).exec();
      }
    }
  );

  hasLoggedAllContacts = false;
};

const MAX_CONTACTS_PER_MONTH = 3; // Very conservative limit