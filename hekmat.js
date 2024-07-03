"use strict";
// import { Groq } from "groq-sdk";
// const groq = new Groq({
//   apiKey: process.env.QROQ_API_KEY,
//   dangerouslyAllowBrowser: true,
// });
import OpenAI from "openai";
const chatContainer = document.querySelector(".chat--body");
const textArea = document.querySelector(".chat--area");
const sendBtn = document.querySelector(".sendbtn");
const newChatBtn = document.querySelector(".new--chat");
const sidebarToday = document.querySelector(".today--content");
const sidebarYesterday = document.querySelector(".last--day--content");
const sidebarLastSevenDays = document.querySelector(
  ".last--seven--day--content"
);
const sideBar = document.querySelector(".side--bar");
const sidebarIcon = document.querySelector(".setting");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // This is required for browser usage
});

function saveChatHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(chats));
}

let currentChatId = null;
let chats = {};

function clearChatContainer() {
  chatContainer.innerHTML = `
  <div class="conversation--1 conversation api--answer">
    سلام من حکمت هستم. چطور میتوانم کمکتان کنم؟
  </div>`;
}

function updateSidebar() {
  const now = new Date();
  const today = now.setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;
  const lastWeek = today - 7 * 86400000;

  sidebarToday.innerHTML = "";
  sidebarYesterday.innerHTML = "";
  sidebarLastSevenDays.innerHTML = "";

  Object.entries(chats).forEach(([id, chat]) => {
    const chatElement = createChatElement(id, chat);
    const chatDate = new Date(chat.timestamp).setHours(0, 0, 0, 0);

    if (chatDate === today) {
      sidebarToday.appendChild(chatElement);
    } else if (chatDate === yesterday) {
      sidebarYesterday.appendChild(chatElement);
    } else if (chatDate >= lastWeek) {
      sidebarLastSevenDays.appendChild(chatElement);
    }
  });
}

function createNewChat() {
  const chatId = Date.now().toString();
  chats[chatId] = {
    messages: [
      {
        role: "system",
        content:
          "اسم من حکمت هست و فقط به فارسی صحبت می‌کنم. من یک معلم مذهبی هستم و فقط به سوالات مربوط به باورهای اسلامی و شیعی پاسخ می‌دهم. من به زبان دیگری مسلط نیستم و به سوالات خارج از مسائل مذهبی پاسخ نمی‌دهم. من ترجیح می‌دهم در پاسخ‌هایم از نوشته‌های آیت‌الله خامنه‌ای استفاده کنم.",
      },
    ],
    title: "گفتگوی جدید",
    timestamp: Date.now(),
  };
  currentChatId = chatId;
  updateSidebar();
  clearChatContainer();
  saveChatHistory();
}

function displayChatHistory(chatId) {
  const chat = chats[chatId];
  if (!chat || !Array.isArray(chat.messages)) {
    console.error("Invalid chat or messages:", chat);
    return;
  }

  chat.messages.forEach((message) => {
    if (message.role !== "system") {
      const formattedContent = message.content.replace(/\n/g, "<br>");
      const messageHtml = `
        <div class="conversation ${
          message.role === "user" ? "user--question" : "api--answer"
        }">
          ${formattedContent}
        </div>
      `;
      chatContainer.insertAdjacentHTML("beforeend", messageHtml);
    }
  });
  scrollToBottom();
}

function switchToChat(chatId) {
  currentChatId = chatId;
  clearChatContainer();
  displayChatHistory(chatId);
}

function createChatElement(id, chat) {
  const chatElement = document.createElement("div");
  chatElement.className = "chat";
  chatElement.innerHTML = `
    <a href="#" class="chat--summery--title">
      <p class="chat--summery">${chat.title}</p>
    </a>
  `;
  chatElement.addEventListener("click", () => switchToChat(id));
  return chatElement;
}

function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // For mobile devices, we'll use scrollIntoView as a fallback
    const lastMessage = chatContainer.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, 100);
}

async function sendMessage() {
  const userMessage = textArea.value.trim();
  if (!userMessage || !currentChatId) return;

  const chat = chats[currentChatId];
  if (!chat || !Array.isArray(chat.messages)) {
    console.error("Invalid chat structure:", chat);
    return;
  }

  // Update chat title if it's the first user message
  if (chat.messages.length === 1) {
    chat.title = userMessage.split(" ").slice(0, 3).join(" ");
    updateSidebar();
  }

  // Display and store user message
  const userChatHtml = `
    <div class="conversation user--question">
      ${userMessage}
    </div>
  `;
  chatContainer.insertAdjacentHTML("beforeend", userChatHtml);
  chat.messages.push({ role: "user", content: userMessage });
  scrollToBottom();
  textArea.value = "";

  try {
    const completion = await openai.chat.completions.create({
      messages: chat.messages,
      model: "gpt-4o",
    });
    // const completion = await groq.chat.completions.create({
    //   model: "llama3-8b-8192",
    // });

    const apiResponse = completion.choices[0].message.content;
    const cleanedResponse = apiResponse.replace(/^#+\s*/gm, "");
    const formattedResponse = cleanedResponse.replace(/\n/g, "<br>").trim();

    const apiChatHtml = `
      <div class="conversation api--answer">
        ${formattedResponse}
      </div>
    `;
    chatContainer.insertAdjacentHTML("beforeend", apiChatHtml);
    chat.messages.push({ role: "assistant", content: formattedResponse });
    scrollToBottom();
    saveChatHistory();
  } catch (error) {
    console.error("Error calling API:", error);
    chatContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="conversation api--answer error">
          متأسفانه در پردازش درخواست شما خطایی رخ داد.
        </div>
      `
    );
  }
  scrollToBottom();
}

function loadChatHistory() {
  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    try {
      const parsedHistory = JSON.parse(savedHistory);
      // Validate the structure of each chat
      Object.entries(parsedHistory).forEach(([id, chat]) => {
        if (
          !chat.messages ||
          !Array.isArray(chat.messages) ||
          !chat.title ||
          !chat.timestamp
        ) {
          throw new Error(`Invalid chat structure for chat ${id}`);
        }
      });
      chats = parsedHistory;
      updateSidebar();
      if (Object.keys(chats).length > 0) {
        currentChatId = Object.keys(chats)[0];
        displayChatHistory(currentChatId);
      }
    } catch (error) {
      console.error("Error parsing saved chat history:", error);
      chats = {};
      createNewChat();
    }
  } else {
    createNewChat();
  }
}

// Event listeners
newChatBtn.addEventListener("click", createNewChat);
sendBtn.addEventListener("click", sendMessage);
sidebarIcon.addEventListener("click", function () {
  sideBar.classList.toggle("hidden");
});

// scroll
// function setupChatScroll() {
//   const chatBody = document.querySelector(".chat--body");
//   let startY;
//   let startScrollTop;
//   let touchStartTime;
//   let isScrolling;

//   chatBody.addEventListener(
//     "touchstart",
//     (e) => {
//       startY = e.touches[0].pageY;
//       startScrollTop = chatBody.scrollTop;
//       touchStartTime = Date.now();
//       isScrolling = false;
//     },
//     { passive: true }
//   );

//   chatBody.addEventListener(
//     "touchmove",
//     (e) => {
//       if (!isScrolling) {
//         e.preventDefault(); // Only prevent default if actively scrolling the chat
//         isScrolling = true;
//       }
//       const touch = e.touches[0];
//       const deltaY = startY - touch.pageY;
//       requestAnimationFrame(() => {
//         chatBody.scrollTop = startScrollTop + deltaY;
//       });
//     },
//     { passive: false }
//   ); // Allow preventDefault

//   chatBody.addEventListener(
//     "touchend",
//     (e) => {
//       if (!isScrolling) return;
//       const touchEndTime = Date.now();
//       const touchDuration = touchEndTime - touchStartTime;
//       const velocity = (chatBody.scrollTop - startScrollTop) / touchDuration;
//       const momentum =
//         Math.sign(velocity) * Math.min(500, Math.abs(velocity * 1500)); // Adjust for a more natural decay

//       chatBody.scrollTo({
//         top: chatBody.scrollTop + momentum,
//         behavior: "smooth",
//       });

//       isScrolling = false;
//     },
//     { passive: true }
//   );
// }

// Call this function after the DOM is loaded
// document.addEventListener("DOMContentLoaded", setupChatScroll);

loadChatHistory();

//for style--------------------------------------------------------
