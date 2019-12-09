const ROOT = '/monsters';
window.addEventListener('load', function(){
let galleryDisplay = document.getElementById('galleryDisplay');
let pageRow = document.getElementById('pageRow');
let page = 1;
let limitPerPage = 1;
let maxPages = 1;

// clear display area
function clearSpace(){
    galleryDisplay.innerHTML = '';
}

function getCount(complete){
    let mine = document.querySelector('#myMonstersOnly').checked;
    let req = new XMLHttpRequest();
    req.open('GET', `${ROOT}/getMonsterCount?mine=${mine}`, true);

    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            let counts = JSON.parse(req.responseText);
            limitPerPage = counts.limitPerPage
            maxPages = Math.ceil(counts.mTotal/limitPerPage);
            complete();
        }
        else{
            console.log(`Error in network request: ${req.statusText}`);
        }
    });
    req.send();
}


    // create search list and display part by name
function getGallery(){
    let mine = document.querySelector('#myMonstersOnly').checked;
    let req = new XMLHttpRequest();
    req.open('GET', `${ROOT}/getGallery?mine=${mine}&page=${page}`, true);

    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            let mlist = JSON.parse(req.responseText);
            for(let i = 0; i < mlist.length; i++){
                makePic(mlist[i]);
            }
            makePages();
        }
        else{
            console.log(`Error in network request: ${req.statusText}`);
        }
    });
    req.send();
}
    //document.getElementById('viewFullTitle').textContent = `${monsterName}`;
    // document.getElementById('viewFullImage').innerHTML = `${bigMonsterPic}`;

let animCount = 2;
function makePic(pic){
    let arrayBuf = new Uint8Array(pic.monsterBlob.data);
        let blob = new Blob([arrayBuf], {type: "image/png"});
        let url = URL.createObjectURL(blob);
        let monsterPic = document.createElement('img');
        monsterPic.src = url;
        monsterPic.name = pic.monsterName;
        let y = (pic.yCoord/500)*100;
        monsterPic.style.top = `${y}%`;
        let x = (pic.xCoord/570)*100;
        monsterPic.style.left = `${x}%`;
        monsterPic.style.width = `${pic.size}%`;
        monsterPic.setAttribute('data-userName', pic.userName);
        monsterPic.setAttribute('data-bgName', pic.bgName);
        monsterPic.setAttribute('data-bgUserName', pic.backgroundUser);
        let div = document.createElement('div');
        if(pic.backgroundBlob != null){
            arrayBuf = new Uint8Array(pic.backgroundBlob.data);
            blob = new Blob([arrayBuf], {type: "image/png"});
            url = URL.createObjectURL(blob);
            div.style.backgroundImage = `url(${url})`;
        }
        div.appendChild(monsterPic);
        div.setAttribute('class', "galleryImage");
        div.addEventListener('mouseover', () => {
            
            if(animCount < 2){
                animCount++;
            }
            else {
                animCount = 0;
            }
            let infoContainer = document.createElement('div');
            infoContainer.setAttribute('class', 'infoContainer');
            let monsterInfo = document.createElement('div');
            monsterInfo.setAttribute('class', 'monsterInfo');
            monsterInfo.innerHTML = `This is <span>${pic.monsterName}</span>`;
            let creatorInfo = document.createElement('div');
            creatorInfo.setAttribute('class', 'creatorInfo');
            creatorInfo.innerHTML = `Created by <span>${pic.userName}</span>`;
            infoContainer.appendChild(monsterInfo);
            infoContainer.appendChild(creatorInfo);
            if(pic.bgName != 'empty'){
                let bgInfo = document.createElement('div');
                bgInfo.setAttribute('class', 'bgInfo');
                bgInfo.innerHTML = `Background <span>${pic.bgName}</span> by <span>${pic.backgroundUser}</span>`;
                infoContainer.appendChild(bgInfo);
            }            
            let animContainer = document.createElement('div');
            animContainer.setAttribute('class', '');
            animContainer.setAttribute('class', 'animContainer');
            let anim = div.cloneNode(true);
            anim.setAttribute('class', `anim${animCount}`);
            animContainer.appendChild(anim);
            document.body.appendChild(infoContainer);
            galleryDisplay.appendChild(animContainer);
            document.body.addEventListener('click',removeInfoContainer);
	    
	    function removeInfoContainer(){
		document.body.removeEventListener('click',removeInfoContainer);
		document.body.removeChild(infoContainer);
		galleryDisplay.removeChild(animContainer);
	    }	    
	});
    galleryDisplay.appendChild(div);
}

// place pagination elements
function makePages(){
    if(maxPages > 1){
        if(page == 1){
            let pointerR = document.createElement('div');
            let pageNumR = document.createElement('div');
            pointerR.id = 'pageRight';
            pageNumR.id = 'numRight';
            pageNumR.textContent = page + 1;
            pointerR.addEventListener('click', () => {
                page++;
                clearPageRow();
                clearSpace();
                getGallery();
            });
            pageRow.appendChild(pageNumR);
            pageRow.appendChild(pointerR);
        }
        else if(page == maxPages){
            let pointerL = document.createElement('div');
            let pageNumL = document.createElement('div');
            pointerL.id = 'pageLeft';
            pageNumL.id = 'numLeft';
            pageNumL.textContent = page - 1;
            pointerL.addEventListener('click', () => {
                page--;
                clearPageRow();
                clearSpace();
                getGallery();
            });
            pageRow.appendChild(pageNumL);
            pageRow.appendChild(pointerL);
        }
        else{
            let pointerR = document.createElement('div');
            let pageNumR = document.createElement('div');
            pointerR.id = 'pageRight';
            pageNumR.id = 'numRight';
            pageNumR.textContent = page + 1;
            let pointerL = document.createElement('div');
            let pageNumL = document.createElement('div');
            pointerL.id = 'pageLeft';
            pageNumL.id = 'numLeft';
            pageNumL.textContent = page - 1;
            pointerR.addEventListener('click', () => {
                page++;
                clearPageRow();
                clearSpace();
                getGallery();
            });
            pointerL.addEventListener('click', () => {
                page--;
                clearPageRow();
                clearSpace();
                getGallery();
            });
            pageRow.appendChild(pageNumR);
            pageRow.appendChild(pointerR);
            pageRow.appendChild(pageNumL);
            pageRow.appendChild(pointerL);
        }
    }
}

// clear page row
function clearPageRow(){
    pageRow.innerHTML = '';
}

// search bar
document.getElementById('searchMonsterName').addEventListener('input', function(){
    document.getElementById('searchMonsterNameList').innerHTML = '';
    let name = document.getElementById('searchMonsterName').value;
    req = new XMLHttpRequest();
    req.open('GET', `${ROOT}/getMonsterByName?name=${name}`, true);

    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            let mlist = JSON.parse(req.responseText);
            runSearchMonsterList(mlist);
        }
        else{
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send();
});

function runSearchMonsterList(mlist){
    let searchList = document.getElementById('searchMonsterNameList');
    let sl = document.getElementById('searchMonsterName');
    let searchSelect = document.createElement('ul');
    searchSelect.setAttribute("class", "list-group");
    searchSelect.setAttribute("id", "searchMonsterNameListUl");
    for(let index = 0; index < mlist.length; index++){
        let opt = document.createElement('li');
        opt.setAttribute("class", "list-group-item");
        opt.setAttribute('value', mlist[index].id);
        opt.textContent = `${mlist[index].name}`;
        opt.addEventListener('click', function(){
            clearSpace();
            sl.value = opt.textContent;
            req = new XMLHttpRequest();
            req.open('GET', `${ROOT}/getSingleGalleryById?mid=${opt.value}`, true);
            req.addEventListener('load', function(){
                if(req.status >= 200 && req.status < 400){
                    document.getElementById('searchMonsterNameList').innerHTML = '';
                    let retPic = JSON.parse(req.responseText);
                    clearPageRow();
                    makePic(retPic[0]);                    
                }
            });
            req.send();
            searchList.innerHTML = '';
        });
        searchSelect.appendChild(opt);
    }
    searchList.appendChild(searchSelect);
    searchList.style.left += `${sl.previousElementSibling.offsetWidth}px`;
}


// if user clicks away from list, remove list
document.body.addEventListener('click', function(event){
    if(event.target.parentElement.id != 'searchMonsterNameListUl'){
        document.getElementById('searchMonsterNameList').innerHTML = '';
    }
});

document.getElementById('myMonstersOnly').addEventListener('change', () => {
    page = 1;
    clearPageRow();
    clearSpace();
    getCount(getGallery);
});

getCount(getGallery);
});
