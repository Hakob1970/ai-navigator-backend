import requests
import asyncio
import feedparser

from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

TOKEN = "8645293983:AAEfUVCWatvE7klR1g1TC6_QBRZm6wdQ1Zc"

# =========================
# BACKEND
# =========================
BACKEND = "http://localhost:3000"

# =========================
# STATE
# =========================
user_states = {}

# =========================
# MENU TEXTS
# =========================
TEXTS = {
    "en": {
        "welcome": "Welcome to AI Navigator!",
        "news": "📰 AI News",
        "categories": "📂 Categories",
        "premium": "💎 Premium",
        "lang": "🌐 Language"
    },
    "ru": {
        "welcome": "Добро пожаловать в AI Navigator!",
        "news": "📰 AI News",
        "categories": "📂 Categories",
        "premium": "💎 Premium",
        "lang": "🌐 Язык"
    }
}

# =========================
# USER REGISTER (backend)
# =========================
def register_user(user_id, username):
    try:
        requests.post(
            f"{BACKEND}/api/user/register",
            json={"userId": str(user_id), "username": username}
        )
    except:
        pass

# =========================
# PREMIUM CHECK
# =========================
def is_premium(user_id):
    try:
        res = requests.get(f"{BACKEND}/api/premium/check?userId={user_id}")
        return res.json().get("premium", False)
    except:
        return False

# =========================
# LANGUAGE
# =========================
def set_language(user_id, username, lang):
    try:
        requests.post(
            f"{BACKEND}/api/user/lang",
            json={
                "userId": str(user_id),
                "username": username,
                "language": lang
            }
        )
    except:
        pass

# =========================
# MENU
# =========================
def menu(lang):
    t = TEXTS.get(lang, TEXTS["en"])
    return ReplyKeyboardMarkup([
        [t["news"]],
        [t["categories"]],
        [t["premium"]],
        [t["lang"]]
    ], resize_keyboard=True)

# =========================
# START
# =========================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    username = update.effective_user.username or "user"

    register_user(user_id, username)

    lang = "en"

    await update.message.reply_text(
        TEXTS[lang]["welcome"],
        reply_markup=menu(lang)
    )

# =========================
# MESSAGE HANDLER
# =========================
async def handle(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    username = update.effective_user.username or "user"
    text = update.message.text

    register_user(user_id, username)

    lang = "en"
    t = TEXTS[lang]

    # NEWS
    if text == t["news"]:
        feed = feedparser.parse("https://techcrunch.com/rss")
        for entry in feed.entries[:3]:
            await update.message.reply_text(f"{entry.title}\n{entry.link}")
        return

    # PREMIUM
    if text == t["premium"]:
        premium = is_premium(user_id)
        if premium:
            await update.message.reply_text("💎 You are Premium!")
        else:
            await update.message.reply_text("❌ Not premium yet")
        return

    # LANGUAGE
    if text == t["lang"]:
        set_language(user_id, username, "ru")
        await update.message.reply_text("🌐 Language updated (backend)")
        return

    await update.message.reply_text("OK")

# =========================
# PREMIUM COMMAND
# =========================
async def give_premium(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    try:
        res = requests.post(
            f"{BACKEND}/api/premium/activate",
            json={"userId": str(user_id)}
        )

        if res.status_code == 200:
            await update.message.reply_text("💎 Premium activated via backend!")
        else:
            await update.message.reply_text("❌ Error")
    except:
        await update.message.reply_text("❌ Backend not reachable")

# =========================
# MAIN
# =========================
def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("premium", give_premium))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle))

    print("🤖 Bot v2 FINAL running...")
    app.run_polling()

if __name__ == "__main__":
    main()

