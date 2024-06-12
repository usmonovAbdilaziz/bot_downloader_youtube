const TelegramBot = require("node-telegram-bot-api");
const token = "7285937152:AAGQExalofgMsRBYch7Dmk64Ul1eIufgJUI";
const bot = new TelegramBot(token, { polling: true });

// video downloader
const YTDL = require("@yohancolla/ytdl");
const request = require("request");
const fs = require("fs");
const ytdl = require("ytdl-core");
const { keyboard, inlineKeyboard } = require("telegraf/markup");
const { url } = require("inspector");

const axios = require('axios');

// Replace with your bot token and channel ID
const channelId ='-1001957128801';
const videos = -1002202032716;


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || msg.from.last_name

  // Check if the user is a member of the channel
  checkSubscription(chatId)
    .then((isSubscribed) => {
      if (isSubscribed) {
        vidDow()
      } else {
        return  bot.sendMessage(chatId, `Assalomu alaykum ${name}! Botdan tuliq  foydalanish kanalga obuna buling.`,{reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Kanal",url:'https://t.me/usmonovabdllaziz'
              },
            ],
          ],
        },
      })
    }
});

// Function to check if a user is subscribed to the channel
async function checkSubscription(userId) {
  try {
    const res = await axios.get(`https://api.telegram.org/bot${token}/getChatMember`, {
      params: {
        chat_id: channelId,
        user_id: userId,
      },
    });

    const status = res.data.result.status;
    return status === 'member' || status === 'administrator' || status === 'creator';
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}
console.log('Bot is running...');
bot.sendMessage(chatId,'Iltimos biroz kuting...');

// Xabarlar uchun listener (handler)
  // Xabarda link bor-yo'qligini tekshirish
  const vidDow = async()=>{
    const text = msg.text 
    if (text && text.startsWith("http")) {
    const videoUrl = text;

    try {
      let info = await ytdl.getInfo(videoUrl);
      const vidTitle = info.videoDetails.title +' @usmonovabdllaziz kanal bilan hamkorlikda.';
      let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

      console.log("Info found!", vidTitle,audioFormats);
      let format = ytdl.chooseFormat(info.formats,`filter: 'audioandvideo'`, { quality: "135" });
      if (!format) {
        bot.sendMessage(chatId, "Formatni topib bo'lmadi.");
        return;
      }
      console.log("Format found!", format);

      // Videoni yuklab olish
      const videoPath = "video.mp4"; // Faylni mahalliy diskka saqlash
      const videoAudio='audio.mp3';

      const download = (url, path, callback) => {
        request.head(url, (err, res, body) => {
          if (err) {
            console.log("Error:", err);
            bot.sendMessage(chatId, "Linkni yuklab olishda xatolik yuz berdi.");
            return;
          }
          request(url)
            .pipe(fs.createWriteStream(path))
            .on("close", callback)
            .on("error", (error) => {
              console.log("Error:", error);
              bot.sendMessage(chatId, "Iltimos youtube video linkini yuboring...");
            });
        });
      };

      download(format.url, videoPath, async () => {
        // Videoni foydalanuvchiga qaytarish
        await bot
          .sendVideo(chatId, videoPath, {
            caption: vidTitle
          })
          .then(() => {
            // Video faylini yuborganidan keyin uni o'chirish
            fs.unlinkSync(videoPath);
          })
          .catch((err) => {
            console.error("Videoni yuborish amalga oshmadi:", err);
            bot.sendMessage(chatId, "Videoni yuborishda xatolik yuz berdi.");
          });
          
      });
    } catch (error) {
      console.error("Failed to get video info:", error);
      bot.sendMessage(chatId, "Video linkni yuklashda xatolik yuz berdi.");
    }
  } else {
    bot.sendMessage(chatId, "Iltimos, video link yuboring.");
  }}
});
