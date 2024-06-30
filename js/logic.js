"use strict";

//selecting the elements
const mainApp = document.querySelector(".main-app");
const sideBar = document.querySelector(".side--bar");
const sideNavbar = document.querySelector(".side--navbar");
const sideSettingIcon = document.querySelector(".setting--icon");
const newChatIcon = document.querySelector(".new--chat--icon");

//event listener
sideSettingIcon.addEventListener("click", function () {
  sideBar.classList.toggle("hidden");
});
