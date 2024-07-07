function loadContent() {
    let userInfo;

    const userPanelClasses = {
        a: "list-group-item list-group-item-action py-3 lh-sm",
        div: "d-flex w-100 align-items-center",
        strong:"mb-1 fs-3 fw-semibold",
        small:"text-body-secondary storage",
    }

    function displayStoragePanel() {

        // create elements
        const panel = document.createElement('a');
        const elementDiv= document.createElement('div');
        const elementStrong = document.createElement('strong');
        const elementSmall = document.createElement('small');

        // style elements
        elementDiv.className = userPanelClasses.div;
        panel.className = userPanelClasses.a;
        elementStrong.className = userPanelClasses.strong;
        elementSmall.className = userPanelClasses.small;
        
        elementStrong.textContent = userInfo.total_storage; 

        // assemble onto DOM
        // elementDiv.appendChild(svg);
        elementDiv.appendChild(elementStrong);
        elementDiv.appendChild(elementSmall);
        panel.appendChild(elementDiv);

        return panel
    }

    function displayPathPanel() {

        // create elements
        const panel = document.createElement('a');
        const elementDiv= document.createElement('div');
        const elementStrong = document.createElement('strong');
        const elementSmall = document.createElement('small');

        // style elements
        elementDiv.className = userPanelClasses.div;
        panel.className = userPanelClasses.a;
        elementStrong.className = userPanelClasses.strong;
        elementSmall.className = userPanelClasses.small;
        
        elementStrong.textContent = userInfo.directory; 

        // assemble onto DOM
        // elementDiv.appendChild(svg);
        elementDiv.appendChild(elementStrong);
        elementDiv.appendChild(elementSmall);
        panel.appendChild(elementDiv);

        return panel
    }

    function displayUserInfo() {
        // display user name
        const span = document.getElementById("nameSpan")
        span.innerText = userInfo.name

        
        let userPanel = document.getElementById("userListGroup")
        pathPanel = displayPathPanel()
        storagePanel = displayStoragePanel()
        userPanel.appendChild(pathPanel);
        userPanel.appendChild(storagePanel);
        // let svg = createSvg()

    }


    function fetchUserInfo() {
        userInfo = {
            id: 1,
            name: "Jon",
            directory: "/app/users/jon",
            total_storage: 0,
        }
        displayUserInfo();
        fetch('/api/getUserInfo', {
            method: "GET",
            headers: {
                "Content-Type": 'application/json',
            }
        }).then(response => {
            if(!response.ok) {
                userInfo = {
                    id: 1,
                    name: "Jon",
                    directory: "/app/users/jon",
                    total_storage: "",
                }
                throw new Error("Failed to retrieve content ", response.statusText)
            }
            return response.json()
        }).then(data => {
            userInfo = data.user_info
            console.log("User Info: ", userInfo)
            displayUserInfo();
        }).catch(error => {
            console.log("Error: ", error)
        })

    }
    function fetchUserDirectory(path) {
        fetch('/api/getUserDir', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => {
            if(!response.ok) {
                throw new Error("Failed to retrieve content ", response.statusText)
            }
            return response.json()
        }).then(data => {
            dirContent = data.dir_content
            console.log("Content: ", dirContent)
        }).catch(error => {
            console.log("Error: ", error)
        })
    }
    // fetchUserInfo();
    // fetchUserDirectory();
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadContent()
})

function goBack() {
    console.log("called")
    window.history.back();
}