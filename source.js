// https://pony.ml/bt-emote-enlarge.user.js
waitForKeyElements("#chatbuffer", ()=>{
    console.log("Loading BerryTube Emote Enlarger");
    let style=document.createElement("style");
    style.appendChild(document.createTextNode(`
        .enlargedEmoteWrapper{
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 99999;
            animation: fadein 0.3s;
        }

        .enlargedEmote{
            display: block;
                        background-color: rgba(0, 0, 0, 0.2);
        }

        .enlargedEmoteClose{
            position: fixed;
            top: 2rem;
            right: 2rem;
            font-size: 5rem;
            font-family: monospaced;
            color: #fff;
            cursor: pointer;
        }

        @keyframes fadein {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `));
    document.head.appendChild(style);

    const getImageSize=url=>{
        let image=new Image();
        image.src=url;
        return {
            width: image.width,
            height: image.height
        };
    };

    //Emote width, emote height, background-image URL, background-position x, background-position y
    const getEnlargedSize=(width, height, url, backgroundX, backgroundY)=>{
        let aspectRatio=width/height;
        let fullImage=getImageSize(url);
        let newWidth;
        let newHeight;

        if(aspectRatio > window.innerWidth/window.innerHeight){
            newWidth=window.innerWidth*0.7;
            newHeight=newWidth/aspectRatio;
        }
        else{
            newHeight=window.innerHeight*0.7;
            newWidth=aspectRatio*newHeight;
        }

        let backgroundWidth=fullImage.width*(newWidth/width);
        let backgroundHeight=fullImage.height*(newHeight/height);

        let x=backgroundX*(newWidth/width);
        let y=backgroundY*(newHeight/height);

        return {
            width: newWidth,
            height: newHeight,
            backgroundWidth:backgroundWidth,
            backgroundHeight:backgroundHeight,
            x:x,
            y:y,
        };
    };

    const enlarge=emote=>{
        let url=/url\((['"])(.+)(\1)\)/.exec(emote.style.backgroundImage)[2];

        let enlargedEmoteWrapper=document.createElement("div");
        enlargedEmoteWrapper.setAttribute("class", "enlargedEmoteWrapper");
        enlargedEmoteWrapper.addEventListener("click", event=>{
            enlargedEmoteWrapper.remove();
        });

        let closeButton=document.createElement("div");
        closeButton.setAttribute("class", "enlargedEmoteClose");
        closeButton.innerHTML="✖";
        closeButton.addEventListener("click", event=>{
            enlargedEmoteWrapper.remove();
        });

        let enlargedEmote=document.createElement("a");
        enlargedEmote.setAttribute("class", "enlargedEmote");
        enlargedEmote.setAttribute("href", url);
        enlargedEmote.setAttribute("target", "_blank");

        let enlargedSize=getEnlargedSize(
            parseInt(emote.style.width.slice(0,-2)),
            parseInt(emote.style.height.slice(0,-2)),
            url,
            parseInt(emote.style.backgroundPosition.split(" ")[0].slice(0,-2)),
            parseInt(emote.style.backgroundPosition.split(" ")[1].slice(0,-2))
        );

        let backgroundPosition;
        if(emote.style.backgroundPosition.includes("%")){
            backgroundPosition=emote.style.backgroundPosition;
        }
        else{
            backgroundPosition=`${enlargedSize.x}px ${enlargedSize.y}px`;
        }

        enlargedEmote.setAttribute("style", `
            background-image: url('${url}');
            background-position: ${backgroundPosition};
            background-size: ${enlargedSize.backgroundWidth}px ${enlargedSize.backgroundHeight}px;
            width: ${enlargedSize.width}px;
            height: ${enlargedSize.height}px;
        `);

        enlargedEmoteWrapper.appendChild(enlargedEmote);
        enlargedEmoteWrapper.appendChild(closeButton);
        document.body.appendChild(enlargedEmoteWrapper);
    };

    const addEnlargeEvent=element=>{
        element.style.cursor="pointer";
        element.addEventListener("click",event=>{
            enlarge(element);
        });
    };

    const callback=(mutationList, observer)=>{
        mutationList.forEach(mutation=>{
            mutation.addedNodes.forEach(element=>{
                element.querySelectorAll(".berryemote").forEach(element=>{
                    addEnlargeEvent(element);
                });
            });
        });
    };

    document.querySelectorAll(".berryemote").forEach(e=>{
        addEnlargeEvent(e);
    });

    const observer=new MutationObserver(callback);

    observer.observe(document.querySelector("#chatbuffer"), {
        attributes:false,
        childList:true,
        subtree:false
    });
    console.log("Loaded BerryTube Emote Enlarger");
});