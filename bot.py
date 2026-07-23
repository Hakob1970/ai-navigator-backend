import requests
import asyncio
import feedparser
import time

from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from telegram import InlineKeyboardMarkup, InlineKeyboardButton

import os

print("=== START OF FILE ===", flush=True)

print("BOT STARTING...")
print("🔥 DEBUG VERSION 777")

TOKEN = os.environ["BOT_TOKEN"]
ADMIN_ID = os.getenv("SUPPORT_ADMIN_ID")

BACKEND = "https://ai-navigator-backend-mcb3.onrender.com"


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
        ["💬 Discussion Club"]
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

    print("🔥 HANDLE ENTERED")
    print("CLICKED TEXT:", text)
    print("TEXT RECEIVED:", repr(text))

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

            print("TELEGRAM ID:", user_id)
            print("FOUND EMAIL:", email)

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

            print("PREMIUM RESPONSE:", data)

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
    # DEFAULT
    # =========================
    await update.message.reply_text("Use the menu 👇")

# =========================
# MAIN 
# =========================
def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("menu", show_menu))
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle))

    print("=== BEFORE POLLING ===", flush=True)
    print("🤖 Bot running clean version...", flush=True)
    
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()

