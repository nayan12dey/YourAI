let prompt=document.querySelector("#prompt");
let container=document.querySelector(".container");
let userMsg=null;
let btn=document.querySelector("#btn");
let chatContainer=document.querySelector(".chat-container");
let Api_Url='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAjWnATSm5PQA5Opk7d_DVrBUco7ynZwus';

function createChatBox(html,className){
    let div=document.createElement("div");
    div.classList.add(className);
    div.innerHTML=html;
    return div;
}

async function getApiResponse(aiChatBox){
    let textElement=aiChatBox.querySelector(".text")
    try{
        let response=await fetch(Api_Url,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                contents: [{"parts":[{"text": userMsg}]}]
            })
        })
        let data=await response.json();
        let apiResponse=data?.candidates[0].content.parts[0].text;
        console.log(apiResponse);

        let lines = apiResponse.split('\n');
        let result = [];
        let insideSection = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            result.push(line);

            // Detect heading (Markdown: # or ##)
            if (/^\*\*.*:\*\*$/.test(line.trim())) {
                insideSection = true;
            } else if (insideSection && (
                lines[i + 1] === undefined || // End of response
                /^\*\*.*:\*\*$/.test(lines[i + 1].trim()) // Next line is a heading
            )) {
                // Insert horizontal line after subpoints of a heading
                result.push('---');
                insideSection = false;
            }
        }
        apiResponse = result.join('\n\n');
        textElement.innerHTML=marked.parse(apiResponse);
    }catch(error){
        console.log(error);
    }
    finally{
        let loadingImg=aiChatBox.querySelector(".loading");
        if(loadingImg){
            loadingImg.remove();
        }
    }
}

function showLoading(){
    let html=`<div class="img">
                <img src="./images/ai-logo.png" alt="ai" width="30">
            </div>
            <p class="text"></p>
            <img class="loading" src="./images/loading-logo.gif" alt="loading" height="50">`

    let aiChatBox=createChatBox(html,"ai-chat-box");
    chatContainer.appendChild(aiChatBox);

    getApiResponse(aiChatBox)
}

function scrollToBottom(){
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


btn.addEventListener("click",()=>{
    userMsg=prompt.value;
    if(userMsg==""){
        container.style.display="flex";
    }
    else{
        container.style.display="none";
    }
    if(!userMsg) return;
    let html=`<div class="img">
                <img src="./images/user.png" alt="user" width="30">
            </div>
            <p class="text"></p>`;

    let userChatBox=createChatBox(html,"user-chat-box");
    userChatBox.querySelector(".text").innerText=userMsg;
    chatContainer.appendChild(userChatBox);
    scrollToBottom();
    prompt.value="";

    setTimeout(showLoading,500);
})