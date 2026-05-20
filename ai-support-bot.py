# ai-support-bot.py

import os
import sqlite3
from datetime import datetime

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

# =========================
# CONFIG
# =========================

TOKEN = os.getenv("SUPPORT_BOT_TOKEN")
ADMIN_ID = int(os.getenv("SUPPORT_ADMIN_ID"))

DB_FILE = "support.db"

# =========================
# DATABASE
# =========================

conn = sqlite3.connect(DB_FILE, check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    first_seen TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    message TEXT,
    created_at TEXT
)
""")

conn.commit()

# =========================
# HELPERS
# =========================

def save_user(user_id, username):
    cursor.execute("""
    INSERT OR IGNORE INTO users (user_id, username, first_seen)
    VALUES (?, ?, ?)
    """, (
        str(user_id),
        username,
        datetime.utcnow().isoformat()
    ))
    conn.commit()


def save_message(user_id, message):
    cursor.execute("""
    INSERT INTO messages (user_id, message, created_at)
    VALUES (?, ?, ?)
    """, (
        str(user_id),
        message,
        datetime.utcnow().isoformat()
    ))
    conn.commit()

# =========================
# START
# =========================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    save_user(
        user.id,
        user.username or "unknown"
    )

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

    save_user(
        user.id,
        user.username or "unknown"
    )

    save_message(user.id, text)

    admin_message = (
        f"📩 NEW SUPPORT MESSAGE\n\n"
        f"👤 User ID: {user.id}\n"
        f"📛 Username: @{user.username}\n\n"
        f"💬 Message:\n{text}\n\n"
        f"Reply:\n"
        f"/reply {user.id} your_message"
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
        return

    try:
        args = context.args

        user_id = args[0]
        reply_text = " ".join(args[1:])

        if not reply_text:
            await update.message.reply_text("❌ Empty reply")
            return

        await context.bot.send_message(
            chat_id=int(user_id),
            text=(
                "📩 Support Reply\n\n"
                f"{reply_text}"
            )
        )

        await update.message.reply_text("✅ Reply sent")

    except Exception as e:
        await update.message.reply_text(f"❌ Error: {e}")

# =========================
# USERS LIST
# =========================

async def users_command(update: Update, context: ContextTypes.DEFAULT_TYPE):

    if update.effective_user.id != ADMIN_ID:
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

    for row in rows:
        text += (
            f"ID: {row[0]}\n"
            f"User: @{row[1]}\n"
            f"Joined: {row[2]}\n\n"
        )

    await update.message.reply_text(text)

# =========================
# MAIN
# =========================

def main():

    if not TOKEN:
        print("❌ SUPPORT_BOT_TOKEN missing")
        return

    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("reply", reply_command))
    app.add_handler(CommandHandler("users", users_command))

    app.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            handle_user_message
        )
    )

    print("🤖 AI Support Bot running...")

    app.run_polling()

# =========================

if __name__ == "__main__":
    main()
