// change function to export if we incorporate multiple js files
function loadSidebar() {

  let accounts;
  const userPanelClasses = {
    a: "list-group-item list-group-item-action py-3 lh-sm",
    div: "d-flex w-100 align-items-center",
    strong:"mb-1 fs-3 fw-semibold",
    small:"text-body-secondary storage",
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
  let showPasswordSignIn = document.getElementById("showPasswordSignIn")

  // ---- Sign in Modal ---
  let signInModal = document.getElementById("signInModal");
  let signInPassword = document.getElementById("signInPassword");

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
    showPassword.checked = false;
  }
  // close enter password modal
  closeSignInModal.onclick = function() {
    signInModal.style.display = "none";
    signInPassword.value = "";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == createAccModal) {
        createAccModal.style.display = "none";
        createAccPassword.value = "";
        createAccName.value = "";
        showPassword.checked = false;
      } else if (event.target == signInModal) {
        signInModal.style.display = "none";
        signInPassword.value = "";
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

        // create elements
        const panel = document.createElement('a');
        const elementDiv= document.createElement('div');
        const elementStrong = document.createElement('strong');
        const elementSmall = document.createElement('small');

        // style elements
        panel.dataset.accountId = id;
        elementDiv.className = userPanelClasses.div;
        panel.className = userPanelClasses.a;
        elementStrong.className = userPanelClasses.strong;
        elementSmall.className = userPanelClasses.small;
        
        elementStrong.textContent = name; 

        // TODO calc if we should display kb or mb  
        elementSmall.textContent = `[${totalStorage} Mb]`
        
        let svg = createSvg()

        // assemble onto DOM
        elementDiv.appendChild(svg);
        elementDiv.appendChild(elementStrong);
        elementDiv.appendChild(elementSmall);
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

  createAccForm.addEventListener('submit', (event) => {
    event.preventDefault(); //removing preventDefault causes the page to reload

    const name = createAccName.value
    const password = createAccPassword.value
    if(!name) {
      // handle cases when user didnt input any values
    }
    if(!password) {
      // handle cases when user didnt input any values
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
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
            // IF response comes back SUCCESS (200)
            // then ... add account to home page (need to query database on loadup and display all accounts)
            // maybe do a page re-load to update accounts on UI?
            createAccPassword.value = "";
            createAccName.value = "";
      })
      .catch((error) => {
          console.error('Error:', error);
          // Handle errors here
      });

    // maybe don't close modal if something goes wrong:
    createAccModal.style.display = "none";
  })

  signInForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let password = signInPassword.value;

    // TODO: Add show password toggle    
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
    }).then(response => response.json())
    .then(data => {
      const message = data.message
      const login = data.login
      if (login) {
        // redirect user to there home page 
        window.location.href = "/home";
      } else {
        // TODO: display failed to login message

      }
    }).catch((error) => {
      console.log("Error: ", error)
    });
    // maybe don't close modal if something goes wrong:
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
  fetchUsers();
}
document.addEventListener('DOMContentLoaded', (event) => {
    loadSidebar()
})