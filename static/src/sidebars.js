/* global bootstrap: false */
(() => {
  'use strict'
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()

document.addEventListener('DOMContentLoaded', (event) => {

  // Get the modal
  var modalOpener = document.getElementById("createAccModal");

  // Get the button that opens the modal
  var openModalBtn = document.getElementById("openAccModal");

  // Get the <span> element that closes the modal
  var closeModalBtn = document.getElementsByClassName("btn-close")[0];

  // When the user clicks on the button, open the modal
  openModalBtn.onclick = function() {
    modalOpener.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  closeModalBtn.onclick = function() {
    modalOpener.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modalOpener) {
        modalOpener.style.display = "none";
      }
  }
});