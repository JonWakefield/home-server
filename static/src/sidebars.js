// probably need to do some slight cleanup / re-working
document.addEventListener('DOMContentLoaded', (event) => {

  function displayUserPanels(userList) {

    userList.forEach(element => {
      console.log("user: ", element)
    });


  }

  function fetchUserInfo() {
    console.log("Fetching user info...")
    fetch('/api/retrieveUsers', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error("Failed to retrieve content " + response.statusText)
      }
      return response.json();
    }).then(data => {
      // console.log("Success: ", data);
      let userList = data["user_info"];
      displayUserPanels(userList);
      // call function to setup UI
    }).catch(error => {
      console.log("Error: ", error)
      // setup error message here
    })
  }
  fetchUserInfo();


  let modalOpener = document.getElementById("createAccModal");

  let openModalBtn = document.getElementById("openAccModal");

  let closeAccModalBtn = document.getElementsByClassName("btn-close")[0];
  let closeSignInModalBtn = document.getElementsByClassName("btn-close")[1];

  let modalForm = document.getElementById("modalForm");

  // account creation fields
  let nameInput = document.getElementById('nameInput')
  let passwordInput = document.getElementById('passwordInput')

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
        passwordInput.type = "text";
      } else {
        passwordInput.type = "password";
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
    passwordInput.value = "";
    nameInput.value = "";
  }
  // close enter password modal
  closeSignInModalBtn.onclick = function() {
    userSignInModal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modalOpener) {
        modalOpener.style.display = "none";
        passwordInput.value = "";
        nameInput.value = "";
      } else if (event.target == userSignInModal) {
        userSignInModal.style.display = "none";
      }
  }

  modalForm.addEventListener('submit', (event) => {
    console.log("In event")
    event.preventDefault();

    const name = nameInput.value
    const password = passwordInput.value
    if(!name) {
      // handle cases when user didnt input any values
    }
    if(!password) {
      // handle cases when user didnt input any values
    }

    // Send API request when button is clicked
    let user = {
      name: name,
      password: password,
    }
      fetch('/api/createUser', {
          method: 'POST', // Change to 'POST' if needed
          headers: {
              'Content-Type': 'application/json',
              // Add any other necessary headers here
          },
          body: JSON.stringify(user)
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
            // IF response comes back SUCCESS (200)
            // then ... add account to home page (need to query database on loadup and display all accounts)
            // maybe do a page re-load to update accounts on UI?
            passwordInput.value = "";
            nameInput.value = "";
      })
      .catch((error) => {
          console.error('Error:', error);
          // Handle errors here
      });
    // can close the modal here
    modalOpener.style.display = "none";
  })
});