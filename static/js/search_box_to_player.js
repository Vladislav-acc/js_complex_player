const earphoneList = [
    "https://www.dropbox.com/scl/fi/rwftkdm0b0r5020kp7zsy/Rick-Astley-Never-Gonna-Give-You-Up-AKG-K712-Pro.mp3?rlkey=c2f0ybro9lthloukfjfr07y0u&dl=0",
    "https://www.dropbox.com/scl/fi/7mah7eilhw2e3ws7zwplz/Rick-Astley-Never-Gonna-Give-You-Up-AKG-K240-MKII.mp3?rlkey=6pqjfv21f6bfckag9e670im99&dl=0",
];
// "https://dl.dropbox.com/scl/fi/xldn15o2rrli4ofe3c6k2/Rick-Astley-Never-Gonna-Give-You-Up-radio-edit.mp3?rlkey=5tsc7ekr36ojaq309ohn2yysv&raw=1"

function formatLink(earphoneLink) {
    return earphoneLink.replace('www', 'dl').replace("dl=0", "raw=1");
}

function replace(old_element, new_element, string) {
    for (let index = 0; index < string.length; index++) {
        if (string[index] === old_element) {
            string[index] = new_element;
        }
    }    
}

function nameInLink(name, link) {
    console.log(link.toLowerCase().replaceAll("-", ""));
    console.log(name.toLowerCase().replaceAll(" ", ""));
    return (link.toLowerCase().replaceAll("-", "").includes(name.toLowerCase().replaceAll(" ", "")))
}


inputBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        console.log("Тык!");
        for (let link of earphoneList) {
            if (nameInLink(inputBox.value, link)) {
                console.log("Есть попадание!");
                if (bigPlayer1.playing) {
                    bigPlayer1.playPauseBtn.click();
                } 
                bigPlayer2.setAttribute("src", formatLink(link));
                // bigPlayer2.seekTo(Math.max(bigPlayer1.progressBar.value, bigPlayer2.progressBar.value));
                bigPlayer2.seekTo(0);
                bigPlayer1.seekTo(0);
                break;
            }
        }
        bigPlayer2  
    }
})

