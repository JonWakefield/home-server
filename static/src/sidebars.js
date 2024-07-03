document.addEventListener('DOMContentLoaded', (event) => {

  let modalOpener = document.getElementById("createAccModal");

  let openModalBtn = document.getElementById("openAccModal");

  let closeAccModalBtn = document.getElementsByClassName("btn-close")[0];
  let closeSignInModalBtn = document.getElementsByClassName("btn-close")[1];

  let modalForm = document.getElementById("modalForm");

  // account creation fields
  let name = document.getElementById('nameInput')
  let password = document.getElementById('passwordInput')

  // ---- Enter Password Modal ---
  let userSignInModal = document.getElementById("signInModal");
  let openSignInModal = document.getElementById("userBox");

  // When the user clicks on the button, open the modal
  openModalBtn.onclick = function() {
    modalOpener.style.display = "block";

    let showPassword = document.getElementById("showPassword")
    showPassword.addEventListener("change", () => {
      let isChecked = showPassword.checked;
      if (isChecked) {
        password.type = "text";
      } else {
        password.type = "password";
      }
    })
  }

  // open enter password modal
  openSignInModal.onclick = function() {
    userSignInModal.style.display = "block";
  }

  // close sign up modal
  closeAccModalBtn.onclick = function() {
    modalOpener.style.display = "none";
    password.value = "";
    name.value = "";
  }
  // close enter password modal
  closeSignInModalBtn.onclick = function() {
    userSignInModal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modalOpener) {
        modalOpener.style.display = "none";
        password.value = "";
        name.value = "";
      } else if (event.target == userSignInModal) {
        userSignInModal.style.display = "none";
      }
  }

  modalForm.addEventListener('submit', (event) => {
    event.preventDefault();

 
    console.log(name.value)
    console.log(password.value)

    // send an api call to create user in SQL table
    // ...
    

    // IF response comes back SUCCESS (200)
    // then ... add account to home page (need to query database on loadup and display all accounts)
    // maybe do a page re-load to update accounts on UI?

    // can close the modal here
    modalOpener.style.display = "none";
  })
});