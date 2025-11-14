from __future__ import annotations
import gradio as gr
from llm import LLMService

svc = LLMService()

with gr.Blocks(theme=gr.themes.Ocean(), title="Lumee Chat") as demo:
    gr.Markdown("# Lumee — ED Waiting Room Companion")
    chatbot = gr.Chatbot(type="messages", height=480)
    msg = gr.Textbox(placeholder="Type your message and press Enter…")
    with gr.Row():
        send_btn = gr.Button("Send", variant="primary")
        stop_btn = gr.Button("Stop")
        clear_btn = gr.Button("Clear chat")

    def _predict(chat, message: str):
        if not message or not message.strip():
            yield gr.update(), ""
            return
        user_text = message.strip()
        chat = (chat or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": "Lumee is typing…"},
        ]
        yield chat, ""

        accumulated = ""
        try:
            for partial in svc.stream(user_text):
                accumulated = partial
                chat[-1]["content"] = accumulated
                yield chat, ""
        finally:
            # input box cleared if we produced anything
            if accumulated:
                yield chat, ""

    def _clear():
        svc.reset()
        return []

    send_evt = send_btn.click(_predict, inputs=[chatbot, msg], outputs=[chatbot, msg])
    submit_evt = msg.submit(_predict, inputs=[chatbot, msg], outputs=[chatbot, msg])
    stop_btn.click(lambda: None, cancels=[send_evt, submit_evt])
    clear_btn.click(_clear, outputs=chatbot)

if __name__ == "__main__":
    demo.launch()
