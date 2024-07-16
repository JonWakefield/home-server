let userInfo;
let selectedFile = null;

let imgExtensions = [
    "png",
    "jpeg",
    "jpg",
    "gif",
]

// TODO FIND CORRECT NUMBER
const FILES_PER_ROW = 4 // may change on screen size? 

const filePanelClasses = {
    rowDiv: "d-flex flex-wrap flex-md-nowrap align-items-center pt-4 pb-2 mb-3 border-bottom",
    fileDiv: "file-spacing",
    label: "file-label",
}

const fileIdxNames = {
    dir: 0,
}

// --- main panel ---
const mainPanel = document.getElementById('main');
let numFiles = 0;
let rowDiv = document.createElement('div');
let main = document.getElementById('main');
let delAcc = false;


let previewContainer;
let previewModal;


function loadContent() {

    const userPanelClasses = {
        a: "list-group-item list-group-item-action py-3 lh-sm",
        div: "d-flex w-100 align-items-center",
        small:"text-body-secondary lp",
        smallStorage: "lp lblue",
        smallDelete: "lp lred",
    }

    // --- noti. banner ----
    const banner = document.getElementById("notification-banner");
    const closeNotiButton = document.getElementById("close-banner");
    const notiMessage = document.getElementById("notification-message");

    closeNotiButton.addEventListener("click", function() {
        banner.classList.remove("show");
    });


    let deleteAcc;



    // --- download file ---
    let download = document.getElementById("downloadFile");

    // --- Preview File ---
    let preview = document.getElementById("previewFile");
    previewModal = document.getElementById("previewModal");
    let previewClose = document.getElementsByClassName("btn-close")[3];
    previewContainer = document.getElementById("preview-container");



    // --- Rename file interactions ---
    let renameFile = document.getElementById("renameFile");
    let renameFileModal = document.getElementById("renameModal");
    let renameForm = document.getElementById("renameForm");
    let renameInput = document.getElementById("renameInput");
    let renameErr = document.getElementById("renameError");
    let oldNameLabel = document.getElementById("oldFileName");
    let closeRenameModal = document.getElementsByClassName("btn-close")[0];

    // --- Delete File interactions ---
    let delFile = document.getElementById('delFile')
    let deleteFileModal = document.getElementById('deleteModal');
    let deleteFileForm = document.getElementById('deleteForm');
    let delError = document.getElementById('delError');
    let closeDeleteModal = document.getElementsByClassName("btn-close")[1];
    let delFileLabel = document.getElementById('delFileName');
    let delTitle = document.getElementById('delTitle');

    // --- Add Folder interactions ---
    let addFolder = document.getElementById("addFolder");
    let addFolderModal = document.getElementById("addFolderModal");
    let addFolderForm = document.getElementById("addFolderForm");
    let addFolderErr = document.getElementById("addFolderErr");
    let closeAddModal = document.getElementsByClassName('btn-close')[2];
    let addFolderInput = document.getElementById("addFolderInput")

    download.addEventListener('click', () => {
        downloadFile();
    })

    preview.addEventListener('click', ()=> {
        previewFile();
    })

    previewClose.onclick = function() {
        previewModal.style.display = "none";
    }


    addFolder.onclick = function() {
        addFolderModal.style.display = "block";
    }

    closeAddModal.onclick = function() {
        addFolderModal.style.display = "none";
        addFolderErr.textContent = "";
        addFolderErr.style.display = "none";
    }

    delFile.onclick = function() {
        if (!selectedFile) {
            notiMessage.textContent = "Please select a file"
            banner.classList.add("show");
            return
        }
        delAcc = false;
        delTitle.textContent = "Delete File?"
        delFileLabel.textContent = selectedFile.querySelector('label').textContent
        deleteFileModal.style.display = "block";
    }
    closeDeleteModal.onclick = function() {
        deleteFileModal.style.display = "none";
        delError.textContent = "";
        delError.style.display = "none";
    }


    renameFile.onclick = function() {
        if (!selectedFile) {
            notiMessage.textContent = "Please select a file"
            banner.classList.add("show");
            return
        }
        oldNameLabel.textContent = selectedFile.querySelector('label').textContent
        renameFileModal.style.display = "block";
    }
    closeRenameModal.onclick = function() {
        renameFileModal.style.display = "none";
        renameErr.textContent = ""
        renameErr.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == renameFileModal) {
        renameFileModal.style.display = "none";
        renameErr.textContent = ""
        renameErr.style.display = "none";
        }
         else if (event.target == deleteFileModal) {
            deleteFileModal.style.display = "none";
            delError.textContent = "";
            delError.style.display = "none";
        } else if (event.target == addFolderModal) {
            addFolderModal.style.display = "none";
            addFolderErr.textContent = "";
            addFolderErr.style.display = "none";
        } else if (event.target == previewModal) {
            previewModal.style.display = "none";
        }
    }

    addFolderForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let folderName = addFolderInput.value;
        if (!validName(folderName)) {
            addFolderErr.textContent = "Invalid Folder Name"
            addFolderErr.style.display = "block";
            return;
        }
        const curParams = getQueryParam("path")
        const url = `/api/addFolder?path=${curParams}`

        let payload = {
            Name: folderName,
        }

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (!response.ok) {
                addFolderErr.textContent = "HTTP Error: " + response.statusText
                addFolderErr.style.display = "block";
                return
            }
            return response.json();
        }).then(data => {
            let created = data.created;
            if (!created) {
                addFolderErr.textContent = "Folder already Exists"
                addFolderErr.style.display = "block";
                return
            } 
            window.location.reload();
        }).catch(e => {
            console.error("Error received: ", e)
            notiMessage.textContent = "Error Received: " + e
            banner.classList.add("show");
        })

    })

    function delAccount() {
        console.log("Deleting account...")

        const url = '/api/deleteAccount'

        fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': "application/json",
            },
        }).then(response => {
            if (!response.ok) {
                delFileLabel.textContent = "HTTP Error: " + response.statusText;
                delFileLabel.style.display = "block";
                return;
            }
            return response.json()
        }).then(data => {
            window.location.href = "/";
        }).catch(e => {
            notiMessage.textContent = "Error Received: " + e
            banner.classList.add("show");
        })

    }

    function deleteFile() {
        let fName = delFileLabel.textContent;
        const curParams = getQueryParam("path")
        const url = `/api/deleteFile?path=${curParams}/${fName}`

        fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': "application/json",
            }
        }).then(response => {
            return response.json()
        }).then(data => {
            let success = data.success;
            if (!success) {
                delFileLabel.textContent = data["message"];
                delFileLabel.style.display = "block";
                return;
            }
            deleteFileModal.style.display = "none";
            delError.style.display = "none";
            window.location.reload();
        }).catch(e => {
            notiMessage.textContent = "Error Received: " + e
            banner.classList.add("show");
        })
    }

    deleteFileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // this submit could be either 
        // 1 -> delete account
        // 2 -> delete file / folder
        if (delAcc) {
            delAccount()
            return
        } 
        deleteFile()
        return
    })


    // can probably be combined with the validatename function from index.js
    function validName(name) {
        // check if the user entered file name is valid
        const invalidChars = /[\\/:*?"<>|\s]/;
        if (!name) {
            return false;
        }
        // Check for invalid characters
        if (invalidChars.test(name)) {
            return false;
        }
        // Check for length (adjust as necessary for your requirements)
        if (name.length > 50) {
            return false;
        }
        
        return true;
    }

    renameForm.addEventListener('submit', (event) => {
        event.preventDefault(); //removing preventDefault causes the page to reload
        let oldName = oldNameLabel.textContent;
        let newName = renameInput.value; 

        if (!validName(newName)) {
            renameErr.textContent = "Invalid File Name"
            renameErr.style.display = "block";
            return
        }
        RenameFile(event, oldName, newName)
    })

    function appendExt(name, ext) {
        return name + "." + ext
    }

    function RenameFile(event, oldName, newName) {
        event.preventDefault();
        // send request to api, renaming selected file
    
        let extension = getExtension(oldName)
        newName = appendExt(newName, extension)

        const curParams = getQueryParam("path")
        const url = `/api/renameFile?path=${curParams}`
        let payload = {
            newFileName: newName,
            fileName: oldName,
        }
        fetch(url, {
            method: "PATCH",
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (!response.ok) {
                renameErr.textContent = "HTTP Error: " + response.statusText
                renameErr.style.display = "block";
                return
            }
            return response.json();
        }).then(data => {
            if (!data) {
                return
            }
            window.location.reload();
        }).catch(e => {
            console.error("Error received: ", e)
            notiMessage.textContent = "Error Received: " + e
            banner.classList.add("show");
        })
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
        deleteAcc = panel
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

    function setupDelAcc() {

        deleteAcc.onclick = function() {
            delTitle.textContent = "Delete Account?"
            delFileLabel.textContent = "This will delete all files and folders"
            deleteFileModal.style.display = "block";
            delAcc = true;
        }

    }


    function fetchUserInfo() {
        fetch('/api/getUserInfo', {
            method: "GET",
            headers: {
                "Content-Type": 'application/json',
            }
        }).then(response => {
            if(!response.ok) {
                notiMessage.textContent = "Failed to retrieve content " + response.statusText
                banner.classList.add("show");
            }
            return response.json()
        }).then(data => {
            userInfo = data.user_info
            console.log("User Info: ", userInfo)
            displayUserInfo();
            setupDelAcc();
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

            const curParams = getQueryParam("path")
            const url = `/api/uploadFile?path=${curParams}`
   
            // call API to store file
            fetch(url, {
                method: "POST",
                body: formData,
            }).then(response => {
                if (!response.ok) {
                    notiMessage.textContent = "Error Received: " + response.statusText
                    banner.classList.add("show");
                    return;
                }
                return response.json()
            }).then(data => {
                window.location.reload();
            }).catch((error) => {
                console.error("Error: ", error);
                notiMessage.textContent = "Error Received: " + error
                banner.classList.add("show");
            });
        } 
    })

    // download file button
    function downloadFile() {
        console.log("Downloading...")
        file = selectedFile;
        if (!file) {
            console.log("No file!")
            notiMessage.textContent = "Please select a file"
            banner.classList.add("show");
            return
        }

        let fileName = file.querySelector('label').textContent
        const curParams = getQueryParam("path")
        const url = `/api/downloadFile?path=${curParams}/${fileName}`

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': "application/json"
            }
        }).then(response => {
            if (!response.ok) {
                notiMessage.textContent = "HTTP Error: " + response.statusText
                banner.classList.add("show");
                return
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

    fetchUserInfo();
    fetchDirContent();
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadContent()
})

function getExtension(file) {
    // gets the extension for a given file
    let ext = ""
    for (let i = file.length - 1; i >= 0; i--) {
        if (file[i] === ".") {
            break
        }
        ext = ext + file[i]
    }
    if (ext.length === file.length) {
        console.log("extension same length as file, must be director!")
        return "dir"
    }
    return ext.split('').reverse().join('');
}

function getExtType(extension) {
    if (imgExtensions.includes(extension)) {
        return "image"
    }
    return "text";
}

function showImage(image) {
    const img = document.createElement('img');
    img.className = 'preview-image';
    img.src = URL.createObjectURL(image);
    previewContainer.appendChild(img);
    return
}

function showIframe(text) {
    const iframe = document.createElement('iframe');
    iframe.className = 'preview-iframe';
    iframe.src = URL.createObjectURL(text)
    previewContainer.appendChild(iframe);
}

function previewFile() {
    file = selectedFile;
    if (!file) {
        notiMessage.textContent = "Select a file to display"
        banner.classList.add("show");
        return;
    }
    let fileName = file.querySelector('label').textContent;
    let extension = getExtension(fileName);
    let extType = getExtType(extension);
    if (!extType) {
        notiMessage.textContent = "Can not open a preview for files of this type"
        banner.classList.add("show");
        return;
    }
    const curParams = getQueryParam("path")
    const url = `/api/previewFile?path=${curParams}/${fileName}`

    fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': "application/json",
        },
    }).then(response => {
        if(!response.ok) {
            notiMessage.textContent = "HTTP Error: " + response.statusText
            banner.classList.add("show");
            return
        }
        return response.blob()
    }).then(blob => {
        previewContainer.innerHTML = '';
        previewModal.style.display = "block";
        if (extType === "image") {
            showImage(blob)
        } else if (extType === "text") {
            showIframe(blob)
        }
    }).catch(e => {
        console.error("Error: ", e)
    })
}


function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param)
}

function fetchDirContent() {
    // fetch names of (files + folders) to be displayed on the dom

    // get cur dir from url params
    const curParams = getQueryParam("path")
    const url = `/api/getDirContent?path=${curParams}`
        
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
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

function createFileDiv() {
    let fileDiv = document.createElement('div');
    fileDiv.className = filePanelClasses.fileDiv;
    return fileDiv
}

function createFileLabel()  {
    let label = document.createElement('label');
    label.className = filePanelClasses.label;
    return label
}


function createRowDiv() {
    let rowDiv = document.createElement('div');
    rowDiv.className = filePanelClasses.rowDiv;
    return rowDiv
}


function isObjectEmpty(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
}

function loadFilesDOM(files) {
    // load received files and folderes ono the DOM

    let numFiles = 0;
    let svg;
    let rowDiv;
    Object.keys(files).forEach(key => {
        if (numFiles % FILES_PER_ROW === 0) {
            // put old row div onto dom, store in array
            if (numFiles != 0) {
                mainPanel.appendChild(rowDiv);
            }
            // create new empty row
            rowDiv = createRowDiv();
        }
        
        // unpack
        let isDir = files[key]
        let fileName = key        

        // create file div & label
        let fileDiv = createFileDiv();
        let label = createFileLabel();
        label.textContent = fileName;
        
        if (isDir) {
            // make dir icon
            svg = createFolderIcon()
            fileDiv.classList.add('folder')
        } else {
            // check extension:
            let ext = getExtension(fileName)
            let type = getExtType(ext)
            if (type === "image") {
                svg = createImgIcon()
            } else {
                svg = createFileIcon()
            }
            fileDiv.classList.add('file')
        }
        
        fileDiv.appendChild(svg);
        fileDiv.appendChild(label);
        rowDiv.appendChild(fileDiv);
        numFiles++;
    });
    mainPanel.appendChild(rowDiv);
    addSelectedListener();
    addFileListener();
    addFolderListener();
}

function addSelectedListener() {
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
        })
    })
}

function addFileListener() {
    document.querySelectorAll('.file').forEach(item => {
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
        })
        item.addEventListener('dblclick', function() {
            // preview file on double click
            previewFile();
        })
    })
}


function detPrevDir(path) {
    let end = 0
    for (let i = path.length - 1; i >= 0; i--) {
        if (path[i] === "/") {
            end = i
            break
        }
    }
    let newPath = path.slice(0, end)
    console.log("NEW PATH: ", newPath)
    return newPath
}


function addFolderListener() {
    document.querySelectorAll('.folder').forEach(item => {
        item.addEventListener('dblclick', function() {

            let fName = item.querySelector('label').textContent;
            const curParams = getQueryParam("path")
            let newParams;
            if (fName === "..") {
                newParams = detPrevDir(curParams)
            } else {
                newParams = curParams + "/" + fName
            }
            window.location.href = `${window.location.pathname}?path=${encodeURIComponent(newParams)}`
        })
    })
}

function goBack() {
    // window.history.back();
    window.location.href = "/"
}

function truncateToTwoDecimals(dividend, divisor) {
    return (dividend / divisor).toFixed(2);
}

function getStorageUnits(size) {
    // determine where we should display kb, mb or gb for on UI
    // default units retrieved from backend are kb

    let len = (size.toString()).length
    if (len <= 5) {
      return ["KB", size];
    }  else if (len > 5 && len <= 9) {
        size = truncateToTwoDecimals(size, 1000)
      return ["MB", size]
    }
    size = truncateToTwoDecimals(size, 10000)
    return ["GB", size]
}
