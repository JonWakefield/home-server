const aTagClass = "list-group-item list-group-item-action py-3 lh-sm";
const divPanelClass = "d-flex w-100 align-items-center";
const strongPanelClass = "mb-1 fs-3 fw-semibold";
const smallPanelClass = "text-body-secondary storage";


function createSvg() {

  // SVG element
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute("width", "20");
  svgElement.setAttribute("height", "20");
  svgElement.setAttribute("fill", "currentColor");
  svgElement.setAttribute("class", "bi bi-chevron-right");
  svgElement.setAttribute("viewBox", "0 0 16 16");

  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("fill-rule", "evenodd");
  pathElement.setAttribute("d", "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708");
  
  svgElement.appendChild(pathElement);

  return svgElement
}

// probably need to do some slight cleanup / re-working
document.addEventListener('DOMContentLoaded', (event) => {


  function displayUserPanels(userList) {

    let userPanel = document.getElementById("userListGroup")

    // Assuming data is an array of objects
    userList.forEach(item => {
        const elementA = document.createElement('a');
        const elementDiv= document.createElement('div');
        const elementStrong = document.createElement('strong');
        const elementSmall = document.createElement('small');
        const svg = createSvg()
        elementDiv.className = divPanelClass;
        elementA.className = aTagClass;
        elementStrong.className = strongPanelClass;
        elementSmall.className = smallPanelClass;
        elementStrong.textContent = item.name; // Customize this to match your data structure
        elementSmall.textContent = `[${item.total_storage} Mb]`
        elementDiv.appendChild(svg);
        elementDiv.appendChild(elementStrong);
        elementDiv.appendChild(elementSmall);
        userPanel.appendChild(elementA);
        elementA.appendChild(elementDiv);
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