function loadSidebar() {

  let accounts;

  const userPanelClasses = {
    a: "list-group-item list-group-item-action py-3 lh-sm",
    div: "d-flex w-100 align-items-center",
    strong:"mb-1 fs-2 fw-semibold",
  }

  let createAccModal = document.getElementById("createAccModal");
  let openCreateAccModal = document.getElementById("openAccModal");
  let closeCreateAccModal = document.getElementsByClassName("btn-close")[0];
  let closeSignInModal = document.getElementsByClassName("btn-close")[1];

  let createAccForm = document.getElementById("modalForm");
  let signInForm = document.getElementById("modalSignInForm");
  
  // -- account creation fields --
  let createAccName = document.getElementById('createAccName');
  let createAccPassword = document.getElementById('createAccPassword');
  let showPasswordCreateAcc = document.getElementById("showPasswordCreateAcc")
  let createAccError = document.getElementById("createAccError");
  
  // ---- Sign in Modal ---
  let signInModal = document.getElementById("signInModal");
  let signInPassword = document.getElementById("signInPassword");
  let showPasswordSignIn = document.getElementById("showPasswordSignIn")
  let signInError = document.getElementById("signInError");

  // When the user clicks on the button, open the modal
  openCreateAccModal.onclick = function() {
    createAccModal.style.display = "block";

    showPasswordCreateAcc.addEventListener("change", () => {
      let isChecked = showPasswordCreateAcc.checked;
      if (isChecked) {
        createAccPassword.type = "text";
      } else {
        createAccPassword.type = "password";
      }
    })
  }
  // close sign up modal
  closeCreateAccModal.onclick = function() {
    createAccModal.style.display = "none";
    createAccPassword.value = "";
    createAccName.value = "";
    showPasswordCreateAcc.checked = false;
  }
  // close enter password modal
  closeSignInModal.onclick = function() {
    signInModal.style.display = "none";
    signInPassword.value = "";
    signInError.style.display = "none";
    signInPassword.classList.remove("err-input");
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == createAccModal) {
        createAccModal.style.display = "none";
        createAccPassword.value = "";
        createAccName.value = "";
        createAccError.style.display = "none";
        createAccName.classList.remove("err-input");
        createAccPassword.classList.remove("err-input");

        showPasswordCreateAcc.checked = false;
      } else if (event.target == signInModal) {
        signInModal.style.display = "none";
        signInPassword.value = "";
        signInError.style.display = "none";
        signInPassword.classList.remove("err-input");
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

        // create elements
        const panel = document.createElement('a');
        const elementDiv= document.createElement('div');
        const elementStrong = document.createElement('strong');

        // style elements
        panel.dataset.accountId = id;
        elementDiv.className = userPanelClasses.div;
        panel.className = userPanelClasses.a;
        elementStrong.className = userPanelClasses.strong;
        
        elementStrong.textContent = name; 

        let svg = createSvg()

        // assemble onto DOM
        elementDiv.appendChild(svg);
        elementDiv.appendChild(elementStrong);
        panel.appendChild(elementDiv);
        userPanel.appendChild(panel);

        panel.addEventListener('click', () => {
          showLoginModal(id);
        })
    });
  }


  function showLoginModal(accountId) {
      // Find the account data by ID 
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        signInModal.dataset.accountId = account.id;
        signInModal.style.display = 'block';
        showPasswordSignIn.addEventListener("change", () => {
          let isChecked = showPasswordSignIn.checked;
          if (isChecked) {
            signInPassword.type = "text";
          } else {
            signInPassword.type = "password";
          }
        })
      }
  }

  function verifyName(name) {
    // verify the entered name is valid
    // Define a regular expression for allowed characters (alphanumeric and underscore)
    const allowedCharacters = /^[a-zA-Z0-9_]+$/;
    
    // Test the username against the regular expression
    return allowedCharacters.test(name);
  }

  createAccForm.addEventListener('submit', (event) => {
    event.preventDefault(); //removing preventDefault causes the page to reload

    const name = createAccName.value
    const password = createAccPassword.value
    if(!verifyName(name)) {
      // handle cases when user didnt input any values
      createAccName.classList.add("err-input");
      createAccError.textContent = "Invalid Name"
      createAccError.style.display = "block";
      return
    } else {
      createAccName.classList.remove("err-input");
      createAccError.style.display = "none";
    }
    if(!password) {
      // handle cases when user didnt input any values
      createAccPassword.classList.add("err-input");
      createAccError.textContent = "Please enter a password"
      createAccError.style.display = "block";
      return
    } else {
      createAccPassword.classList.remove("err-input");
      createAccError.style.display = "none";
    }

    let user = {
      name: name,
      password: password,
    }
      fetch('/api/createUser', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(user)
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        success = data.success
        if (!success) {
          message = data.message
          createAccError.textContent = message
          createAccError.style.display = "block";
          return
        }
        window.location.reload()
        createAccModal.style.display = "none";
      })
      .catch((error) => {
        console.error("Error: ", error)
      });
  })

  signInForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let password = signInPassword.value;
    if (!password) {
      signInPassword.classList.add('err-input');
      signInError.textContent = "Please enter a password"
      signInError.style.display = "block";
      return;
    } else {
      signInPassword.classList.remove('err-input');
      signInError.style.display = "none";
    }
    const id = signInModal.dataset.accountId;
    let account;
    // determine account
    accounts.forEach(user => {
      if (user.id == id) {
        account = user
      }
    })
    let userCreds = {
      id: account.id,
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
    }).then(response => {
      if (!response.ok) {
        signInError.textContent = "HTTP Error: " + response.statusText
        signInError.style.display = "block";
      }
      return response.json();
    })
    .then(data => {
      const message = data.message
      const login = data.login
      if (login) {
        // redirect user to there home page 
        window.location.href = '/home?path=home';
        signInModal.style.display = "none";
        signInPassword.value = "";
        signInError.style.display = "none";
      } else {
        signInError.textContent = message
        signInError.style.display = "block";
      }
    }).catch((error) => {
      console.error("Error: ", error)
    });
  })
  function fetchUsers() {
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
      accounts = data["user_info"];
      displayUserPanels(accounts);
    }).catch(error => {
      console.error("Error: ", error)
    })
  }
  fetchUsers();
}
document.addEventListener('DOMContentLoaded', (event) => {
    loadSidebar()
})


// Could export function to a utils file
function getStorageUnits(size) {
  // determine where we should display kb, mb or gb for on UI
  // default units retrieved from backend are kb
  // this function assumes two decimal points of precision
  size = size.toString()
  let len = size.length
  if (len <= 6) {
    return ["KB", size];
  }  else if (len > 6 && len <= 9) {
    size = size / 1000
    return ["MB", size]
  }
  size = size / (1000 * 1000)
  return ["GB", size]
}