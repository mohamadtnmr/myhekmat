"use strict";

//selecting the elements
const mainApp = document.querySelector(".main-app");
const sideBar = document.querySelector(".side--bar");
const sideNavbar = document.querySelector(".side--navbar");
const sideSettingIcon = document.querySelector(".setting--icon");
const newChatIcon = document.querySelector(".new--chat--icon");

//event listener
// Function to toggle the sidebar
function toggleSidebar() {
  sideBar.classList.toggle("hidden");
}

// Add event listeners for both click and touchstart
sideSettingIcon.addEventListener("click", toggleSidebar);
sideSettingIcon.addEventListener("touchstart", toggleSidebar);



//for mobile scrolling................................
document.addEventListener(
  "touchstart",
  function (event) {
    event.preventDefault();
  },
  { passive: false }
);
document.addEventListener(
  "touchmove",
  function (event) {
    // Do not call preventDefault here unless necessary
  },
  { passive: true }
);
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener(
    "touchstart",
    function (event) {
      // Prevent default touch behavior (including scrolling)
      event.preventDefault();
    },
    false
  );

  document.body.addEventListener("click", function () {
    // Allow scrolling after a click
    document.body.removeEventListener(
      "touchstart",
      function (event) {
        event.preventDefault();
      },
      false
    );
  });
});


