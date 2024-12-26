console.log('Integrated!!');

let currentSong = new Audio();
let songList;
let currentFolder;

const playlistFetch = async () => {
    let list = await fetch("http://127.0.0.1:3000/Songs/");
    let response = await list.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // LoadMediaMetadata
            let data = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`);
            let response = await data.json()
            let playListCard = `<div data-folder="${folder}" class="card">
                <img src="${(`/Songs/${folder}/cover.jpg`) ? `/Songs/${folder}/cover.jpg` :
                    "https://i.scdn.co/image/ab67706f00000002d9b4d9b3682fbf8ed557469d"}" alt="cover">
                    <div class="premise">
                    <h4>${response.title}</h4>${response.description}
                    </div>
                    <div class="play flex item-center">
                    <img class="svg-width" src="Assets/play.svg" alt="Play">
                    </div>
                    </div>`
            playList = document.querySelector(".right .playlists")
            playList.innerHTML = playList.innerHTML + playListCard

        }
    }
    // Attaching eventListener to card so that songList can be fetched
    // console.log(document.getElementsByClassName("card"), "all the cards")
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async e => {
            // console.log('Fetching songs', e.currentTarget.dataset.folder);
            songList = await songFetch(e.currentTarget.dataset.folder);
            await populatingLibrary(songList) // Running populating library so that on clicking the playlist card appropriate library can be loaded
            // console.log(songList, 'songList');
        });
    });
    // console.log(songList, "inplaylistfetch")
    // return songList
}

const songFetch = async (folder) => {
    currentFolder = folder;
    let list = await fetch(`http://127.0.0.1:3000/Songs/${folder}/`);
    let response = await list.text();
    let element = document.createElement("div");
    element.innerHTML = response
    let atag = element.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < atag.length; index++) {
        let element = atag[index]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs
}

function playSong(track, pause = false) {
    currentSong.src = track.includes('http') ? track : `/Songs/${currentFolder}/` + track;
    // console.log(currentSong, currentSong.src);
    if (!pause) {
        currentSong.play();
        play.src = "Assets/pause.svg";
    };
    document.querySelector(".playbar .songname").innerHTML = (track.includes('http')) ? track.match(/Songs\/[^/]+\/(.+)/)[1].replaceAll('%20', ' ').replaceAll('.mp3', '') : track;
    trackLength()
}

async function populatingLibrary(songList) {
    document.querySelector(".left .library").innerHTML = "" //Emptying the library so that everytime on clicking on a different playlist a new library can be loaded
    let card = (songName) => {
        return `<div class="song flex item-center">
                    <div class="music circle ptr">
                        <img class="svg-width" src="Assets/music.svg" alt="Music">
                    </div>
                    <div class="info">
                    ${songName}
                    </div>
                    <div class="circle ptr">
                        <img class="svg-width" src="Assets/play.svg" alt="Play">
                    </div>
                </div>`}
    // console.log(songList, "inpopulation");
    songList.forEach(element => {
        // console.log('songList', element)
        // console.log(element.match(/Songs\/[^/]+\/(.+)/)[1].replaceAll('%20', ' ').replace('.mp3', ''));
        document.querySelector(".left .library").insertAdjacentHTML('beforeend', `${card(element.match(/Songs\/[^/]+\/(.+)/)[1].replaceAll('%20', ' ').replaceAll('.mp3', ''))}`);
    });
    // Attaching an event listener to each song in the library
    Array.from(document.querySelectorAll(".library .song ")).forEach(e => {
        e.addEventListener('click', () => {
            playSong(e.querySelector(".info").innerHTML.trim() + ".mp3")
            // console.log(e.querySelector(".info").innerHTML.trim() + ".mp3");
        });
    });
}

async function trackLength() {
    currentSong.addEventListener('timeupdate', () => {
        // console.log(currentSong.duration, currentSong.currentTime);
        let runTime = currentSong.duration; // Get track duration in seconds 
        let currentTime = currentSong.currentTime;
        // Check if runTime and currentTime are valid numbers 
        if (!isNaN(runTime) && !isNaN(currentTime)) {
            //Moving the seeker
            let percentage = (currentTime / runTime) * 100;
            document.querySelector(".seekbar .seeker").style.width = `${percentage}%`
            // Format time to 00:00
            let formatTime = (seconds) => {
                let minutes = Math.floor(seconds / 60);
                let remainingSeconds = Math.floor(seconds % 60);
                return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
            };
            document.querySelector(".seekbar-time .run-time").innerHTML = formatTime(runTime);
            document.querySelector(".seekbar-time .current-time").innerHTML = formatTime(currentTime);
        }
    });
}

async function main() {
    playlistFetch()
    let songList = await songFetch('NCS')
    await populatingLibrary(songList)
    playSong(songList[0], true);
    // Attaching event listener to controls
    document.querySelector(".play-btn").addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "Assets/pause.svg"
        } else {
            currentSong.pause()
            play.src = "Assets/play.svg"
        }
    });

    // previous.addEventListener()
    previous.addEventListener('click', () => {
        let index = songList.indexOf(currentSong.src);
        console.log(index, "index");
        if (index > 0 && index <= songList.length - 1) { // Check if the index is valid and within range
            playSong(songList[index - 1]); // Play the next song
        } else {
            playSong(songList[index]); // If at the end of the list, replay the current song
        }
        console.log(index, songList);
        console.log(currentSong.src.split("/").slice(-1)[0]);
    });

    // next.addEventListener()
    next.addEventListener('click', () => {
        let index = songList.indexOf(currentSong.src);
        if (index >= 0 && index < songList.length - 1) { // Check if the index is valid and within range
            playSong(songList[index + 1]); // Play the next song
        } else {
            playSong(songList[index]); // If at the end of the list, replay the current song
        }
        console.log(index, songList);
        console.log(currentSong.src.split("/").slice(-1)[0]);
    });

    // Muting // Adding an event listener to the volume icon
    let volume = document.querySelector(".playbar .volume img");
    // console.log(currentSong.muted);// Logging the current mute state
    volume.addEventListener('click', () => {
        currentSong.muted = !currentSong.muted;// Toggling the mute state
        volume.src = currentSong.muted ? "Assets/mute.svg" : "Assets/volume.svg";// Updating the volume icon based on the mute state
        volumeRange.value = currentSong.muted ? 0:100// Changing the volumeRange
        // console.log("Muted state:", currentSong.muted);// Logging to the console to confirm the action
    });

    // Controlling volume
    console.log(volumeRange, "range")
    volumeRange.addEventListener('change',e=>{
        console.log(e.target.value);
        currentSong.volume = e.target.value/100
        volume.src = (e.target.value==0) ? "Assets/mute.svg" : "Assets/volume.svg";
    })

    //Seekbar event listener
    document.querySelector(".seekbar").addEventListener('click', (e) => {
        const seekbar = document.querySelector(".seekbar");
        const seeker = document.querySelector(".seekbar .seeker");

        // Calculate the percentage based on click position within the seekbar
        const percentage = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;

        if (percentage > 0 && percentage <= 100) {
            console.log(percentage, "percent");
            seeker.style.width = `${percentage}%`;
            currentSong.currentTime = currentSong.duration * (percentage / 100);
        }
    });

}

main()