let userInfo;
let selectedFile = null;

// TODO FIND CORRECT NUMBER
const FILES_PER_ROW = 8 // may change on screen size? 

const filePanelClasses = {
    rowDiv: "d-flex flex-wrap flex-md-nowrap align-items-center pt-4 pb-2 mb-3 border-bottom",
    fileDiv: "file-spacing",
    label: "file-label",
}

const fileIdxNames = {
    dir: 0,
}

let numFiles = 0;
let rowDiv = document.createElement('div');
let main = document.getElementById('main');

function addFile() {
    // adds file to the DOM
}

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

        const [units, size] = getStorageUnits(userInfo.total_storage)
        smallAmt.textContent = `${size} ${units}`; 

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
                if (!response.ok) {
                    // TODO: display banner message indicating failed upload
                }
                return response.json()
            }).then(data => {
                console.log('Success: ', data);
                // TODO need to add file to UI
                // fetchDirContent();
            }).catch((error) => {
                // TODO: Display banner message indicating failed upload
                console.error("Error: ", error);
            });
        } 
    })

    fetchUserInfo();
    fetchDirContent();
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadContent()
})




function loadFilesDOM(files) {

    function createFileIcon() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("class", "bi-file");
        svg.setAttribute("viewBox", "0 0 16 16");
        const path1 = document.createElementNS(svgNS, "path");
        path1.setAttribute("d", "M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5");
        const path2 = document.createElementNS(svgNS, "path");
        path2.setAttribute("d", "M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z");
        svg.appendChild(path1);   
        svg.appendChild(path2);
        return svg;
    }
    function createFolderIcon() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("class", "bi-file");
        svg.setAttribute("viewBox", "0 0 16 16");
        const path1 = document.createElementNS(svgNS, "path");
        path1.setAttribute("d", "M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z");
        svg.appendChild(path1);   
        return svg;
    }
    function createImgIcon() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("class", "bi-file");
        svg.setAttribute("viewBox", "0 0 16 16");
        const path1 = document.createElementNS(svgNS, "path");
        path1.setAttribute("d", "M6.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3");
        const path2 = document.createElementNS(svgNS, "path");
        path2.setAttribute("d", "M14 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM4 1a1 1 0 0 0-1 1v10l2.224-2.224a.5.5 0 0 1 .61-.075L8 11l2.157-3.02a.5.5 0 0 1 .76-.063L13 10V4.5h-2A1.5 1.5 0 0 1 9.5 3V1z");
        svg.appendChild(path1);   
        svg.appendChild(path2);
        return svg;
    }
    
    
    let numFiles = 0;
    let svg;
    let rowDiv = document.createElement('div');
    let main = document.getElementById('main');
    main.appendChild(rowDiv);

    // ONE IDEA COULD BE TO CALC HOW MANY ROWS i WILL NEED, STORE EACH ROW IN AN ARRAY THAN ITERATE THROUGH ?

    rowDiv.className = filePanelClasses.rowDiv;
    Object.keys(files).forEach(key => {
        // TODO need to perform a check to ensure I don't display the current folder
        
        console.log("Key: ", key)
        let vals = files[key]
        let fileName = key
        let isDir = vals[fileIdxNames.dir]
        if (isDir === 'true') {
            // make dir icon
            svg = createFolderIcon()
        } else {
            svg = createFileIcon()
        }
        // create file div
        let fileDiv = document.createElement('div');
        let label = document.createElement('label');
        fileDiv.className = filePanelClasses.fileDiv;
        label.className = filePanelClasses.label;
        label.textContent = fileName;
        fileDiv.appendChild(svg)
        fileDiv.appendChild(label)
        
        if (numFiles > FILES_PER_ROW) {
            // TODO will need to test this out and see what happens...

            // create a new row element
        } else {
            rowDiv.appendChild(fileDiv);
        }
        numFiles++;
        
    })
    addFileListeners();
}

function addFileListeners() {
    document.querySelectorAll('.file-spacing').forEach(item => {
        item.addEventListener('click', function() {
            // TODO figure out how to deselect the cur. selected file
    
            // remove from previous file
            if (selectedFile) {
                selectedFile.classList.remove('selected-file');
            }

            // add selected file to the item
            item.classList.add('selected-file');
            
            // update reference
            selectedFile = item;
    
            // can perform other options here as well...
            // ...
        })
    })
}

// download file button
function downloadFile() {
    console.log("Downloading...")
    file = selectedFile;
    if (!file) {
        // TODO add some type of alert
        console.log("could not find a file...")
        return
    }

    let fileName = file.querySelector('label').textContent
    let payload = {
        fileName: fileName,
        path: userInfo.directory,
    }

    fetch('/api/downloadFile', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(payload)
    }).then(response => {
        if (!response.ok) {
            // TODO add error to banner
            throw new Error("Failed to retrieve content ", response.statusText);
        }
        return response.blob(); 
    }).then(file => {
        const urlObject = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = urlObject;

        // Extract the file name from the URL
        const filename = fileName
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // release the object URL
        window.URL.revokeObjectURL(urlObject);
        
    }).catch(error => {
        console.log("Error received: ", error)
    })
}

function goBack() {
    console.log("called")
    window.history.back();
}

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
