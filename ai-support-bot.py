import os
import sqlite3
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

# =========================
# ENV
# =========================

TOKEN = os.getenv("SUPPORT_BOT_TOKEN")
ADMIN_ID = os.getenv("SUPPORT_ADMIN_ID")

if not TOKEN:
    raise Exception("SUPPORT_BOT_TOKEN is missing")

if not ADMIN_ID:
    raise Exception("SUPPORT_ADMIN_ID is missing")

ADMIN_ID = int(ADMIN_ID)

# =========================
# DB
# =========================

conn = sqlite3.connect("support.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

# =========================
# HELPERS
# =========================

def save_user(user_id, username):
    cursor.execute("""
    INSERT OR IGNORE INTO users (user_id, username)
    VALUES (?, ?)
    """, (user_id, username))
    conn.commit()


def save_message(user_id, text):
    cursor.execute("""
    INSERT INTO messages (user_id, text)
    VALUES (?, ?)
    """, (user_id, text))
    conn.commit()

# =========================
# START
# =========================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    username = user.username or "no_username"

    save_user(user.id, username)

    await update.message.reply_text(
        "👋 Welcome to AI Navigator Support\n\n"
        "Send your message or problem here.\n"
        "Support will answer you through this bot."
    )

# =========================
# USER MESSAGE
# =========================

async def handle_user_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    text = update.message.text

    username = f"@{user.username}" if user.username else f"id_{user.id}"

    save_user(user.id, username)
    save_message(user.id, text)

    admin_message = (
        "📩 NEW SUPPORT MESSAGE\n\n"
        f"👤 User ID: {user.id}\n"
        f"📛 Username: @{username}\n\n"
        f"💬 Message:\n{text}\n\n"
        f"Reply:\n/reply {user.id} your_message"
    )

    await context.bot.send_message(
        chat_id=ADMIN_ID,
        text=admin_message
    )

    await update.message.reply_text(
        "✅ Your message has been sent to support."
    )

# =========================
# ADMIN REPLY
# =========================

async def reply_command(update: Update, context: ContextTypes.DEFAULT_TYPE):

    if update.effective_user.id != ADMIN_ID:
        await update.message.reply_text("⛔ Not allowed")
        return

    if len(context.args) < 2:
        await update.message.reply_text("Usage: /reply user_id message")
        return

    try:
        user_id = int(context.args[0])
        reply_text = " ".join(context.args[1:])

        await context.bot.send_message(
            chat_id=user_id,
            text=(
                "📩 Support Reply\n\n"
                f"{reply_text}\n\n"
                "— AI Navigator Support"
            )
        )

        await update.message.reply_text("✅ Reply sent")

    except Exception as e:
        await update.message.reply_text(f"❌ Error: {e}")

# =========================
# USERS LIST (ADMIN)
# =========================

async def users_command(update: Update, context: ContextTypes.DEFAULT_TYPE):

    if update.effective_user.id != ADMIN_ID:
        await update.message.reply_text("⛔ Not allowed")
        return

    cursor.execute("""
    SELECT user_id, username, first_seen
    FROM users
    ORDER BY first_seen DESC
    LIMIT 20
    """)

    rows = cursor.fetchall()

    if not rows:
        await update.message.reply_text("No users yet")
        return

    text = "👥 LAST USERS\n\n"

    for r in rows:
        uid, username, created = r

        uname = f"@{username}" if username and username != "no_username" else "no_username"

        text += (
            f"ID: {uid}\n"
            f"User: {uname}\n"
            f"Joined: {created}\n\n"
        )

    await update.message.reply_text(text)

# =========================
# MAIN
# =========================

def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("reply", reply_command))
    app.add_handler(CommandHandler("users", users_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_user_message))

    print("🤖 Support Bot running...")
    app.run_polling()

if __name__ == "__main__":
    main()
