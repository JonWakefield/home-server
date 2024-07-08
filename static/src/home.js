let userInfo;

function loadContent() {

    const userPanelClasses = {
        a: "list-group-item list-group-item-action py-3 lh-sm",
        div: "d-flex w-100 align-items-center",
        small:"text-body-secondary lp",
        smallStorage: "lp lblue",
        smallDelete: "lp lred",
    }

    function displayDeleteAccPanel() {

        function createPersonXSVG() {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("xmlns", svgNS);
            svg.setAttribute("width", "16");
            svg.setAttribute("height", "16");
            svg.setAttribute("fill", "currentColor");
            svg.setAttribute("class", "bi bi-person-x");
            svg.setAttribute("viewBox", "0 0 16 16");
            svg.setAttribute("class", "lred");
        
            const path1 = document.createElementNS(svgNS, "path");
            path1.setAttribute("d", "M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z");
        
            const path2 = document.createElementNS(svgNS, "path");
            path2.setAttribute("d", "M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708");
        
            svg.appendChild(path1);
            svg.appendChild(path2);
        
            return svg;
        }
        
        // create elements
        const panel = document.createElement('a');
        const div= document.createElement('div');
        const small = document.createElement('small');

        // style elements
        panel.className = userPanelClasses.a;
        div.className = userPanelClasses.div;
        small.className = userPanelClasses.smallDelete;
        
        // apply user path
        small.textContent = "Delete Account"; 

        // create storage svg
        svg = createPersonXSVG();

        // assemble onto DOM
        div.appendChild(svg);
        div.appendChild(small);
        panel.appendChild(div);

        return panel
    }

    function displayStoragePanel() {

        function createFloppySVG() {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("xmlns", svgNS);
            svg.setAttribute("width", "16");
            svg.setAttribute("height", "16");
            svg.setAttribute("fill", "currentColor");
            svg.setAttribute("class", "bi bi-floppy2-fill");
            svg.setAttribute("viewBox", "0 0 16 16");
        
            const path1 = document.createElementNS(svgNS, "path");
            path1.setAttribute("d", "M12 2h-2v3h2z");
        
            const path2 = document.createElementNS(svgNS, "path");
            path2.setAttribute("d", "M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1");
        
            svg.appendChild(path1);
            svg.appendChild(path2);
        
            return svg;
        }

        // create elements
        const panel = document.createElement('a');
        const div= document.createElement('div');
        const smallLabel = document.createElement('small');
        const smallAmt = document.createElement('small');

        // style elements
        panel.className = userPanelClasses.a;
        div.className = userPanelClasses.div;
        smallLabel.className = userPanelClasses.small;
        smallAmt.className = userPanelClasses.smallStorage;
        
        // apply text
        smallLabel.textContent = "Storage Used:";
        // TODO Need function to calc to display Mb or Kb or Gb 
        smallAmt.textContent = `${userInfo.total_storage} Mb`; 

        // create storage svg
        svg = createFloppySVG();

        // assemble onto DOM
        div.appendChild(svg);
        div.appendChild(smallLabel);
        div.appendChild(smallAmt);
        panel.appendChild(div);

        return panel
    }

    function displayPathPanel() {

        function createCompassSVG() {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("xmlns", svgNS);
            svg.setAttribute("width", "16");
            svg.setAttribute("height", "16");
            svg.setAttribute("fill", "currentColor");
            svg.setAttribute("class", "bi bi-compass");
            svg.setAttribute("viewBox", "0 0 16 16");
        
            const path1 = document.createElementNS(svgNS, "path");
            path1.setAttribute("d", "M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016m6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0");
        
            const path2 = document.createElementNS(svgNS, "path");
            path2.setAttribute("d", "m6.94 7.44 4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z");
        
            svg.appendChild(path1);
            svg.appendChild(path2);
        
            return svg;
        }
        
        // create elements
        const panel = document.createElement('a');
        const div= document.createElement('div');
        const small = document.createElement('small');

        // style elements
        panel.className = userPanelClasses.a;
        div.className = userPanelClasses.div;
        small.className = userPanelClasses.small;
        
        // apply user path
        small.textContent = userInfo.directory; 

        // create storage svg
        svg = createCompassSVG();

        // assemble onto DOM
        div.appendChild(svg);
        div.appendChild(small);
        panel.appendChild(div);

        return panel
    }

    function displayUserInfo() {
        // display user name
        const span = document.getElementById("nameSpan")
        span.innerText = userInfo.name

        
        let userPanel = document.getElementById("userListGroup")
        pathPanel = displayPathPanel()
        storagePanel = displayStoragePanel()
        deleteAccPanel = displayDeleteAccPanel();
        userPanel.appendChild(pathPanel);
        userPanel.appendChild(storagePanel);
        userPanel.appendChild(deleteAccPanel);
    }


    function fetchUserInfo() {
        fetch('/api/getUserInfo', {
            method: "GET",
            headers: {
                "Content-Type": 'application/json',
            }
        }).then(response => {
            if(!response.ok) {
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
    function fetchDirContent(path) {
        fetch('/api/getDirContent', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userInfo)
        }).then(response => {
            if(!response.ok) {
                throw new Error("Failed to retrieve content ", response.statusText)
            }
            return response.json()
        }).then(data => {
            let files = data.files
            console.log("Content: ", files)
            loadFilesDOM(files)
        }).catch(error => {
            console.log("Error: ", error)
        })
    }
    fetchUserInfo();
    fetchDirContent();
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadContent()
})

document.getElementById("fileUpload").addEventListener('change', (event) => {
    const files = event.target.files;
    if(files.length > 0) {
        const file = files[0];
        console.log('File Selected: ', file.name)

        const formData = new FormData();

        formData.append('file', file);
        formData.append('id', userInfo.id);
        formData.append('name', userInfo.name);
        formData.append('directory', userInfo.directory);


        // call API to store file
        fetch("/api/uploadFile", {
            method: "POST",
            body: formData,
        }).then(response => {
            response.json()
        }).then(data => {
            console.log('Success: ', data);
        }).catch((error) => {
            console.error("Error: ", error);
        });
    }
})


function loadFilesDOM(files) {

    Object.keys(files).forEach(key => {
        console.log("Key: ", key)
        let vals = files[key]
        
        
    })

}

function goBack() {
    console.log("called")
    window.history.back();
}