import os
import logging

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO
)

logging.getLogger("httpx").setLevel(logging.ERROR)
logging.getLogger("httpcore").setLevel(logging.ERROR)
logging.getLogger("telegram").setLevel(logging.ERROR)
logging.getLogger("telegram.ext").setLevel(logging.ERROR)

logger = logging.getLogger(__name__)


import requests
import asyncio
import feedparser
import time

from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    CallbackQueryHandler,
    filters
)
from telegram import InlineKeyboardMarkup, InlineKeyboardButton
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

print("=== START OF FILE ===", flush=True)

print("🛡 SECURITY TEST VERSION", flush=True)
print("BOT STARTING...")
print("🔥 DEBUG VERSION 777")
print("PID:", os.getpid(), flush=True)

TOKEN = os.environ["BOT_TOKEN"]
ADMIN_ID = os.getenv("SUPPORT_ADMIN_ID")

BACKEND = "https://ai-navigator-backend-mcb3.onrender.com"


SUPPORT_MODE = set()
ADMIN_REPLY_MODE = {}

def check_webhook():

    try:

        res = requests.get(
            f"https://api.telegram.org/bot{TOKEN}/getWebhookInfo",
            timeout=10
        )

        data = res.json()

        url = data.get(
            "result",
            {}
        ).get(
            "url",
            ""
        )

        if url:

            print("🚨 SECURITY ALERT")
            print("WEBHOOK DETECTED:", url)

        else:

            print("🛡 WEBHOOK CHECK PASSED")

    except Exception as e:

        print(
            "⚠️ WEBHOOK CHECK FAILED:",
            e
        )


def link_telegram(email, telegram_id):
    try:
        res = requests.post(
            f"{BACKEND}/api/user/link-telegram",
            json={
                "email": email,
                "telegramId": str(telegram_id)
            },
            timeout=8
        )

        print("LINK TELEGRAM STATUS:", res.status_code)
        print("LINK TELEGRAM RESPONSE:", res.text)

        if res.status_code != 200:
            print("❌ LINK FAILED FOR:", email)

    except Exception as e:
        print("❌ LINK TELEGRAM ERROR:", e)


# =========================
# MENU TEXTS
# =========================
TEXTS = {
    "en": {
        "welcome": "Welcome to AI Navigator!",
        "news": "📰 AI News",
        "categories": "📂 Categories",
        "premium": "💎 Premium",
        "discuss": "💬 Discussion Club"
    },
    "ru": {
        "welcome": "Добро пожаловать в AI Navigator!",
        "news": "📰 AI News",
        "categories": "📂 Categories",
        "premium": "💎 Premium",
        "discuss": "💬 Discussion Club"
    },
    "am": {
        "welcome": "Բարի գալուստ AI Navigator!",
        "news": "📰 AI News",
        "categories": "📂 Կատեգորիաներ",
        "premium": "💎 Պրեմիում",
        "discuss": "💬 Discussion Club"
    }

}


# =========================
# BACKEND FUNCTIONS
# =========================

def register_user(user_id, username):
    try:
        requests.post(f"{BACKEND}/api/user/register",
            json={"userId": str(user_id), "username": username},
            timeout=3
        )
    except:
        pass


def get_lang(user_id):
    try:
        res = requests.get(
            f"{BACKEND}/api/user/lang",
            params={"userId": user_id},
            timeout=3
        )
        return res.json().get("language", "en")
    except:
        return "en"

def is_premium(email):
    print("BOT PREMIUM CHECK:", email)
    try:
        res = requests.get(
            f"{BACKEND}/api/bot/premium",
            params={"email": email},
            timeout=3
        )
        return res.json().get("premium", False)
    except:
        return False



# =========================
# MENU
# =========================
def menu(lang):
    return ReplyKeyboardMarkup([
        ["📰 AI News"],
        ["💬 Discussion Club"],
        ["🛠 Support"]
    ], resize_keyboard=True,
       is_persistent=True)

async def show_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = get_lang(user_id)

    await update.message.reply_text(
        "Menu",
        reply_markup=menu(lang)
    )


# =========================
# START
# =========================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    user_id = update.effective_user.id

    logger.info(
        f"START COMMAND | user_id={user_id}"

    )
    
    username = update.effective_user.username or "user"

    register_user(user_id, username)

    if context.args:

        email = context.args[0].strip().lower()

        # basic validation
        if "@" not in email:
            await update.message.reply_text("Invalid link")
            return

        try:
            requests.post(
                f"{BACKEND}/api/user/link-telegram",
                json={
                    "email": email,
                    "telegramId": str(user_id)
                },
                timeout=3
            )
        except Exception as e:
            print("Telegram link error:", e)

    lang = get_lang(user_id)

    await update.message.reply_text(
        TEXTS[lang]["welcome"],
        reply_markup=menu(lang)
    )


# =========================
# HANDLER
# =========================
async def handle(update: Update, context: ContextTypes.DEFAULT_TYPE):

    user_id = update.effective_user.id
    username = update.effective_user.username or "user"

    text = update.message.text.strip()

    # =========================
    # ADMIN REPLY MODE
    # =========================

if user_id == int(ADMIN_ID) and user_id in ADMIN_REPLY_MODE:

    target_user = ADMIN_REPLY_MODE[user_id]

    await context.bot.send_message(
        chat_id=int(target_user),
        text=(
            "🛠 Support reply:\n\n"
            f"{text}"
        )
    )

    del ADMIN_REPLY_MODE[user_id]

    await update.message.reply_text(
        "✅ Reply sent"
    )

    return

    logger.info("🔥 HANDLE ENTERED")
    logger.info(f"CLICKED TEXT: {text}")
    logger.info(f"TEXT RECEIVED: {repr(text)}")

    register_user(user_id, username)
    

    # =========================
    # NEWS
    # =========================
    if "📰 AI News" in text:
        feed = feedparser.parse("https://techcrunch.com/rss")

        for entry in feed.entries[:4]:
            await update.message.reply_text(f"{entry.title}\n{entry.link}")

        return


    # =========================
    # DISCUSSION CLUB
    # =========================
    if text == "💬 Discussion Club":

        try:
            # 1. берем email по telegramId
            res = requests.get(
                f"{BACKEND}/api/user/get-email",
                params={"telegramId": str(user_id)},
                timeout=3
            )
            email = res.json().get("email")

            logger.debug("Telegram user checked")

            if not email:
                await update.message.reply_text(
                    "🔒 Discussion Club is for Premium users only\n\n"
                    "👉 Upgrade here:\n"
                    "https://ai-navigator-frontend.vercel.app/#pricing"
                )
                return

            # 2. проверяем premium ЧЕРЕЗ EMAIL
            res = requests.get(
                f"{BACKEND}/api/bot/premium",
                params={"email": email},
                timeout=3
            )

            data = res.json()
            premium = bool(data.get("premium"))

            logger.debug("Premium status checked")

            # 3. доступ
            if premium:
                await update.message.reply_text(
                    "💬 <b>Discussion Club</b>\n\n"
                    "Welcome to the private AI community 🚀\n\n"
                    "<a href='https://t.me/+UnxQr7zNlrI5Njhi'>👉 Open Discussion Club</a>",
                    parse_mode="HTML",
                    disable_web_page_preview=True
                )
            else:
                await update.message.reply_text(
                    "🔒 Discussion Club is for Premium users only\n\n"
                    "👉 Upgrade here:\n"
                    "https://ai-navigator-frontend.vercel.app/#pricing"
                )

        except Exception as e:
            print("DISCUSSION CLUB ERROR:", e)

            await update.message.reply_text(
                "⚠️ Server error. Try again later."
            )
            return

        # =========================
        # SUPPORT
        # =========================
    if text == "🛠 Support":
        
        SUPPORT_MODE.add(user_id)

        print("SUPPORT MODE ADD:", SUPPORT_MODE)
        
        await update.message.reply_text(
            "🛠 Support\n\n"
            "Please describe your problem.\n"
            "Your message will be sent to support."
        )

        return

    print("SUPPORT CHECK:", user_id, SUPPORT_MODE)
    # =========================
    # SUPPORT MESSAGE
    # =========================
    if user_id in SUPPORT_MODE:
         print("SUPPORT MODE ACTIVE:", user_id)

         SUPPORT_MODE.remove(user_id)

         keyboard = InlineKeyboardMarkup([
             [
                 InlineKeyboardButton(
                     "✉️ Reply",
                     callback_data=f"reply:{user_id}"
                 )
             ]
         ])

         print("KEYBOARD CREATED")

         await context.bot.send_message(
             chat_id=int(ADMIN_ID),
             text=(
                 "🛠 NEW SUPPORT MESSAGE\n\n"
                 f"👤 User ID: {user_id}\n"
                 f"📛 Username: @{username}\n\n"
                 f"💬 Message:\n{text}"
             ),
             reply_markup=keyboard
         )

         print("MESSAGE WITH BUTTON SENT")

         await update.message.reply_text(
             "✅ Your message was sent to support."
         )

         return
    
            
    # =========================
    # DEFAULT
    # =========================
    await update.message.reply_text("Use the menu 👇")

# =========================
# ADMIN REPLY
# =========================
async def admin_reply(update: Update, context: ContextTypes.DEFAULT_TYPE):

    user_id = update.effective_user.id

    if user_id != int(ADMIN_ID):
        return

    if len(context.args) < 2:
        await update.message.reply_text(
            "Usage:\n/reply USER_ID message"
        )
        return

    target_user = context.args[0]
    message = " ".join(context.args[1:])

    try:
        await context.bot.send_message(
            chat_id=int(target_user),
            text=(
                "🛠 Support reply:\n\n"
                f"{message}"
            )
        )

        await update.message.reply_text(
        "✅ Reply sent"
        )

    except Exception as e:
        await update.message.reply_text(
            f"❌ Error: {e}"
        )


# =========================
# ADMIN REPLY BUTTON
# =========================
async def reply_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):

    query = update.callback_query

    await query.answer()

    admin_id = query.from_user.id

    if admin_id != int(ADMIN_ID):
        return

    user_id = query.data.split(":")[1]

    ADMIN_REPLY_MODE[admin_id] = user_id

    await query.message.reply_text(
        "✍️ Write your reply message:"
    )



async def error_handler(update, context):
    logger.error(
        f"ERROR: {context.error}"
    )

# =========================
# MAIN 
# =========================
def main():

    print("🚀 BOT INSTANCE STARTED", flush=True)

    
    check_webhook()
    app = Application.builder().token(TOKEN).build()

    app.add_error_handler(error_handler)

    app.add_handler(CommandHandler("menu", show_menu))
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("reply", admin_reply))
    app.add_handler(
    CallbackQueryHandler(reply_callback, pattern="^reply:")
)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle))

    print("=== BEFORE POLLING ===", flush=True)
    print("🤖 Bot running clean version...", flush=True)
    print("PID:", os.getpid(), flush=True)
    
    app.run_polling(
    drop_pending_updates=True,
    close_loop=False
)


if __name__ == "__main__":
    main()

