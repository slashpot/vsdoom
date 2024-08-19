const vscode = acquireVsCodeApi();

function arrayBufferToBase64(bytes) {
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

window.addEventListener("message", async (event) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
        case "save game": {
            const files = Module.FS.readdir("/savefiles/").slice(2);

            const cachePromises = files.map(async (file) => {
                console.log(`Saving files...${file}`);

                const data = Module.FS.readFile(`/savefiles/${file}`);
                const base64Data = arrayBufferToBase64(data);

                vscode.postMessage({
                    command: "saveGame",
                    fileName: file,
                    data: base64Data,
                });
            });

            Promise.all(cachePromises)
                .then(() => {
                    console.log(
                        "success",
                        "Game Savefiles successfuly Saved!",
                        2000
                    );
                })
                .catch((error) => {
                    console.error("error", "While saving savefile data!", 2000);
                    console.warn(`Error: While saving savefile data! ${error}`);
                });
            break;
        }
    }
});

