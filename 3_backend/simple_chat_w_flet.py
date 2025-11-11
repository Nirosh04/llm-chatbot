import flet as ft
from llm_backend.llm_service import config, logger, get_llm_output
#from llm_backend import llm_main

r'''


cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python simple_chat_w_flet.py



cd "C:\Users\...\llm_chatbot\python"
venv\Scripts\activate
python flask_server_app.py

'''

import flet as ft


# set here the connection functions to backend
# ----------------





def main(page: ft.Page):
    page.title = "Chat Bubble Example"
    page.scroll = "none"

    # Scrollable chat area
    chat_column = ft.Column(
        expand=True,
        spacing=5,
        scroll="auto",
        horizontal_alignment=ft.CrossAxisAlignment.STRETCH,  # stretch rows to full width
    )

    # User input
    user_input = ft.TextField(
        hint_text="Type your message...",
        expand=True
    )

    def send_message(e):
        message = user_input.value.strip()
        if not message:
            return

        # Add user's message (right aligned)
        chat_column.controls.append(
            ft.Row(
                [
                    ft.Container(
                        ft.Text(message),
                        padding=ft.padding.all(10),
                        bgcolor=ft.Colors.BLUE_GREY_700,
                        border_radius=10,
                        width=300
                    )
                ],
                alignment=ft.MainAxisAlignment.END
            )
        )

        # Chatbot response (left aligned)
        chatbot_message = get_llm_output(message)
        chat_column.controls.append(
            ft.Row(
                [
                    ft.Container(
                        ft.Text(chatbot_message),
                        padding=ft.padding.all(10),
                        bgcolor=ft.Colors.GREY_700,
                        border_radius=10,
                        width=300
                    )
                ],
                alignment=ft.MainAxisAlignment.START
            )
        )

        user_input.value = ""
        page.update()
        chat_column.scroll_to(offset=99999, duration=300)

    send_button = ft.ElevatedButton("Send", on_click=send_message)

    # Input row
    input_row = ft.Container(
        ft.Row([user_input, send_button]),
        padding=ft.padding.all(10),
        bgcolor=ft.Colors.GREY_900,
    )

    # Chat area container — keeps shape even when empty
    chat_area = ft.Container(
        content=chat_column,
        expand=True,
        padding=10,
        border=ft.border.all(1, ft.Colors.GREY_800),
        border_radius=10,
        bgcolor=ft.Colors.BLACK12,
        alignment=ft.alignment.top_center,
        height=page.height,  # keeps it full size
    )

    # Layout
    layout = ft.Column(
        [chat_area, input_row],
        expand=True
    )

    page.add(layout)

ft.app(target=main)
