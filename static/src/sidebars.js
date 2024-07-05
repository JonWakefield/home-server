


// change function to export if we incorporate multiple js files
function loadSidebar() {
  console.log("Loading sidebar...")

  const aTagClass = "list-group-item list-group-item-action py-3 lh-sm";
  const divPanelClass = "d-flex w-100 align-items-center";
  const strongPanelClass = "mb-1 fs-3 fw-semibold";
  const smallPanelClass = "text-body-secondary storage";
  let accounts;

  let modalOpener = document.getElementById("createAccModal");

  let openModalBtn = document.getElementById("openAccModal");

  let closeAccModalBtn = document.getElementsByClassName("btn-close")[0];
  let closeSignInModalBtn = document.getElementsByClassName("btn-close")[1];

  let modalForm = document.getElementById("modalForm");
  let signInForm = document.getElementById("modalSignInForm");
  // account creation fields
  let nameInput = document.getElementById('nameInput')
  let passwordInput = document.getElementById('passwordInput')

  // ---- Enter Password Modal ---
  let userSignInModal = document.getElementById("signInModal");

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

  function displayUserPanels(userList) {

    let userPanel = document.getElementById("userListGroup")

    // Assuming data is an array of objects
    userList.forEach(item => {
        const id = item.id
        const name = item.name
        const totalStorage = item.total_storage

        const panel = document.createElement('a');
        panel.dataset.accountId = id;
        const elementDiv= document.createElement('div');
        const elementStrong = document.createElement('strong');
        const elementSmall = document.createElement('small');
        const svg = createSvg()
        elementDiv.className = divPanelClass;
        panel.className = aTagClass;
        elementStrong.className = strongPanelClass;
        elementSmall.className = smallPanelClass;

        elementStrong.textContent = name; // Customize this to match your data structure
        // TODO calc if we should display kb or mb  
        elementSmall.textContent = `[${totalStorage} Mb]`
        elementDiv.appendChild(svg);
        elementDiv.appendChild(elementStrong);
        elementDiv.appendChild(elementSmall);
        userPanel.appendChild(panel);
        panel.appendChild(elementDiv);


        panel.addEventListener('click', () => {
          showLoginModal(id);
        })
    });
  }


  function showLoginModal(accountId) {
      // Find the account data by ID (this could be more complex in real scenarios)
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        userSignInModal.dataset.accountId = account.id;
        userSignInModal.style.display = 'block';
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

    // maybe don't close modal if something goes wrong:
    modalOpener.style.display = "none";
  })

  signInForm.addEventListener('submit', (event) => {

    const passwordInput = document.getElementById("signInPassword") 
    let password = passwordInput.value;

    // TODO: Add show password toggle

    
    
    const id = userSignInModal.dataset.accountId;
    let account;
    // determine account
    accounts.forEach(user => {
      if (user.id == id) {
        account = user
      }
    })
    let userCreds = {
      name: account.name,
      password: password,
    }

    // fetch login:
    fetch('/api/signin', {
      method: "POST",
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify(userCreds)
    }).then(response => response.json())
    .then(data => {
      console.log("login status: ", data);
    }).catch((error) => {
      console.log("Error: ", error)
    });
  })

  // maybe don't close modal if something goes wrong:


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
      accounts = data["user_info"];
      console.log("users: ", accounts)
      displayUserPanels(accounts);
      // call function to setup UI
    }).catch(error => {
      console.log("Error: ", error)
      // setup error message here
    })
  }
  fetchUserInfo();



}
document.addEventListener('DOMContentLoaded', (event) => {
    loadSidebar()
})