"use client";

import { Bot, Send, User } from "lucide-react";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

const Chat = () => {
  const { messages, input, handleSubmit, handleInputChange, status } = useChat({
    api: "/api/openai",
  });

  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } =
      chatContainer.current as HTMLDivElement;
    if (scrollHeight >= scrollTop + offsetHeight) {
      chatContainer.current?.scrollTo(0, scrollHeight + 200);
    }
  };

  useEffect(() => {
    scroll()
  } , [messages])

  const renderResponse = () => {
    return (
      <div className='response'>
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={` ${m.role === "user" ? "user-chat" : "ai-chat"}`}
          >
            {m.role === "user" ? <User /> : <Bot />}
            <div className='w-full ml-4'>
              <p className='message'>{m.content}</p>
              {index < messages.length - 1 && (
                <div className='horizontal-line' />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={chatContainer} className='chat'>
      {renderResponse()}
      <form onSubmit={handleSubmit} className='mainForm'>
        <input
          type='text'
          className='mainButton'
          placeholder='Say anything'
          onChange={handleInputChange}
          disabled={status !== "ready"}
          value={input}
        />
        <button>
          <Send />
        </button>
      </form>
    </div>
  );
};

export default Chat;
