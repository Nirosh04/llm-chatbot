import flet as ft


r'''


cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python simple_chat_w_flet.py



cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python flask_server_app.py

'''


def main(page: ft.Page):
    page.title = "Simple Chatbot (Flet)"
    page.scroll = "auto"

    # Chat display takes all available space
    chat_display = ft.TextField(
        multiline=True,
        read_only=True,
        expand=True,
        border=ft.InputBorder.OUTLINE,
        text_align=ft.TextAlign.LEFT,
        value="Hello! How can I help you?\n" + "-"*100 + "\n",    
        )

    # User input row
    user_input = ft.TextField(
        hint_text="Type your message...",
        expand=True
    )

    def send_message(e):
        if user_input.value.strip():
            chat_display.value += user_input.value + "\n" + "-" * 100 + "\n"
            user_input.value = ""
            page.update()

    send_button = ft.ElevatedButton("Send", on_click=send_message)

    input_row = ft.Row(
        [user_input, send_button],
        alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
    )

    # Column layout: chat_display expands, input_row stays at bottom
    page.add(
        ft.Column(
            [
                chat_display,
                input_row
            ],
            expand=True
        )
    )

ft.app(target=main)

