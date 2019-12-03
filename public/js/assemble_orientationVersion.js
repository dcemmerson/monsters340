window.addEventListener('load', function(){

  var assemblyFrame = document.getElementById('assemblyFrame');
  let controlTable = document.getElementById('partTable');
  let partsArr = document.getElementsByClassName('positionParts');
  let pArray = [];

//begin search display block
  let uniqueID = 0;
  let zCount = 0;
  function displays(ob){
    ob.addEventListener('click', function listen(event){
      uniqueID++;
      zCount++;
      let addPart = new Image;
      addPart.src = event.target.src;
      addPart.style.zIndex = zCount;
      addPart.className = 'positionParts';
      addPart.style.width = '100%';
      addPart.style.transform = 'rotate(0deg)';
      addPart.name = event.target.name;
      let id = uniqueID;
      addPart.setAttribute('data-id', uniqueID);
      let tr = document.createElement('tr');
      tr.setAttribute('scope', 'row');
      let newRow = `<td data-pid="${event.target.getAttribute('data-pid')}">${event.target.name}</td><td><input type="number" data-type="partSize" data-id="${id}" min="5" max="100" value="100"></td><td><input type="number" data-type="pOrient" data-id="${id}" min="0" max="360" value="0"></td><td><input type="number" data-type="partZ" data-id="${id}" min="1" max="${zCount}" value="${zCount}"></td><td><button class="deleteBtn" data-type="partDel" data-id="${id}">X</button></td>`;
      tr.innerHTML += newRow;
      controlTable.appendChild(tr);
      assemblyFrame.appendChild(addPart);
      freshDrags(addPart);
      let zindexes = partTable.querySelectorAll("input[data-type='partZ']");
      for(let z in zindexes){
        zindexes[z].max = zCount;
      }
    });
  }

//end search display block

//begin drag positioning block

  function freshDrags(ob){  //set listeners on draggable item
  let part;
  let shiftX;
  let shiftY;
  ob.addEventListener('mousedown', function (event){
        this.ondragstart = function(){  //prevent default drag image behavior
          return false;
        }
        // checkAlpha() recursive function to allow clicking through transparency in an element
        // then transfer the event to the element below
        // active element is set to part variable
        function checkAlpha(current){
            if(current.id === "assemblyFrame"){
                    part = -1;
                    return;
            }
            let ctx = document.createElement("canvas").getContext("2d");
            
            /************************** checking rotation **********************/
            let centerX = Math.round((current.getBoundingClientRect().right + current.getBoundingClientRect().left)/2);
            let centerY = Math.round((current.getBoundingClientRect().bottom + (current.getBoundingClientRect().top))/2) + window.scrollY;
            let angleRad = 0;
            let angleDeg = 0;
            let cosC = 0;
            let sinC = 0;
            let cs = window.getComputedStyle(current);
            let trans = cs.getPropertyValue('transform');
            let tArr = trans.split('(')[1].split(')')[0].split(',');
            cosC = tArr[0];
            sinC = tArr[1];
            angleRad = Math.atan2(sinC, cosC);
            angleDeg = Math.round(angleRad * (180/Math.PI));
            
            /********************** check alpha section ***********************/
            let x = y = w = h = alpha = 0;
            x = ((event.pageY - centerY) * Math.sin(angleRad)) + ((event.pageX - centerX) * Math.cos(angleRad)) + current.offsetWidth/2;
            y = ((event.pageY - centerY) * Math.cos(angleRad)) - ((event.pageX - centerX) * Math.sin(angleRad)) + current.offsetHeight/2;
            w = ctx.canvas.width = current.width;
            h = ctx.canvas.height = current.height;
            alpha = 0;
            
            ctx.drawImage(current, 0, 0, w, h);
            alpha = ctx.getImageData(x, y, 1, 1).data[3]; // [0]R [1]G [2]B [3]A
            if(alpha !== 0){
                    part = current;
                    return;
            }
            else{
                    current.hidden = true;
                    let elementBelow = document.elementFromPoint(event.clientX, event.clientY);
                    checkAlpha(elementBelow);
                    current.hidden = false;
            }
        }
        checkAlpha(this);
        if(part == -1){
                return;
        }
        part.style.border = '1px dotted rgba(0,0,0,0.5)';
        //align mouse with position of element
        shiftY = event.clientY - part.offsetTop + window.scrollY;
        shiftX = event.clientX - part.offsetLeft;

        assemblyFrame.append(part);
        moveAt(event.pageX, event.pageY);        

        assemblyFrame.addEventListener('mousemove', onMouseMove);

        part.ondragstart = function(){  //prevent default drag image behavior
          return false;
        }
      });

    function onMouseMove(event){
          moveAt(event.pageX, event.pageY);
                //set movement boundary for positioning elements
            let maxRight = assemblyFrame.getBoundingClientRect().left + assemblyFrame.offsetWidth - 5;
            let maxLeft = assemblyFrame.getBoundingClientRect().left + 5;
            let maxTop = assemblyFrame.getBoundingClientRect().top + window.scrollY + 5;
            let maxBottom = assemblyFrame.getBoundingClientRect().top + window.scrollY + assemblyFrame.offsetHeight - 5;
            if(event.pageX >= maxRight || event.pageX <= maxLeft || event.pageY <= maxTop || event.pageY >= maxBottom){
            
            assemblyFrame.removeEventListener('mousemove', onMouseMove);
            part.onmouseup = null;
            assemblyFrame.style.overflow = 'hidden';
            return;       
          }
        }
    function moveAt(pageX, pageY){
          part.style.left = `${pageX - shiftX}px`;
          part.style.top = `${pageY - shiftY}px`;
        }

    document.body.addEventListener('mouseup', function(event){
          if(part){
            assemblyFrame.removeEventListener('mousemove', onMouseMove);
            part.onmouseup = null;
            assemblyFrame.style.overflow = 'hidden';
            part.style.border = 'none';
          }
        });
  }
//end drag positioning block


//begin control panel block
  controlTable.addEventListener('input', event => {

    //zindex
    if(event.target.getAttribute('data-type') == 'partZ'){
      for(let part in partsArr){
        if(partsArr[part].getAttribute('data-id') == event.target.getAttribute('data-id')){
          let zprevious = Number(partsArr[part].style.zIndex);
          let zpost = event.target.value;
          partsArr[part].style.zIndex = zpost;
          let zindexes = partTable.querySelectorAll("input[data-type='partZ']");
          for(let part2 in partsArr){
            if(partsArr[part2].style.zIndex == zpost && partsArr[part2] != partsArr[part]){
              partsArr[part2].style.zIndex = zprevious;
              for(let z in zindexes){
                if(partsArr[part2].getAttribute('data-id') == zindexes[z].getAttribute('data-id')){
                  zindexes[z].value = zprevious;
                }
              }
            }
          }
        }
      }
    }

    //size
    if(event.target.getAttribute('data-type') == 'partSize'){
      for(let part in partsArr){
        if(partsArr[part].getAttribute('data-id') == event.target.getAttribute('data-id')){
          partsArr[part].style.width = `${event.target.value}%`;
          return;
        }
      }
    }

    // orientation
    if(event.target.getAttribute('data-type') == 'pOrient'){
      for(let part in partsArr){
        if(partsArr[part].getAttribute('data-id') == event.target.getAttribute('data-id')){
          partsArr[part].style.transform = `rotate(${event.target.value}deg)`;
          return;
        }
      }
    }
  });

  //remove part
  controlTable.addEventListener('click', event => {
    if(event.target.nodeName == "BUTTON"){
      for(let n = 0; n < partsArr.length; n++){
        if(partsArr[n].getAttribute('data-id') == event.target.getAttribute('data-id')){
          if(confirm(`Would you like to remove ${partsArr[n].name}?`)){
            let p = event.target.parentNode.parentNode;
            p.parentNode.removeChild(p);
            zCount--;
            for(let i = 0; i < partsArr.length; i++){
              if(Number(partsArr[i].style.zIndex) > Number(partsArr[n].style.zIndex)){
                partsArr[i].style.zIndex -= Number(1);
              }
            }
            let zindexes = partTable.querySelectorAll("input[data-type='partZ']");
            for(let z in zindexes){
              if(zindexes[z].value > Number(partsArr[n].style.zIndex)){
                zindexes[z].value -= 1;
                zindexes[z].max = zCount;
              }
            }
            partsArr[n].parentNode.removeChild(partsArr[n]);
            return;
          }
        }
      }
    }
  });

//end parts table block

// this is the best line that has ever been written  !important
document.getElementById('monName').addEventListener('input', function() {
    document.getElementById('monName').setAttribute('value', document.getElementById('monName').value);
});

// clear assembly space
function clearSpace(){
    assemblyFrame.innerHTML = '';
    document.getElementById('partTable').innerHTML = '';
    document.getElementById('monName').setAttribute('data-mid', "alpha");
    document.getElementById('monName').removeAttribute('value');
    document.getElementById('monName').textContent = '';
    let unb = document.getElementById('updateNameButton');
    if(unb){
        unb.parentNode.removeChild(unb);
    }
    uniqueID = 0;
    zCount = 0;
}

document.getElementById('clearConfirm').addEventListener('click', event => {
    clearSpace();
    $('#clearConfirmation').modal('toggle');
});

//**************************** DB block ********************************//

// create search list and display part by name
document.getElementById('searchName').addEventListener('input', function(){
    document.getElementById('searchNameList').innerHTML = '';
    let name = document.getElementById('searchName').value;
    let mine = document.querySelector('#myParts').checked;
    let req = new XMLHttpRequest();
    req.open('GET', `/getPartsByName?name=${name}&mine=${mine}`, true);

    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            console.log(`Success: ${req.statusText}`);
            let plist = JSON.parse(req.responseText);
            runSearchList(plist);
        }
        else{
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send();
});

function runSearchList(plist){
    let searchList = document.getElementById('searchNameList');
    let sl = document.getElementById('searchName');
    let searchSelect = document.createElement('ul');
    searchSelect.setAttribute("class", "list-group");
    searchSelect.setAttribute("id", "searchNameListUl");
    for(let index = 0; index < plist.length; index++){
        let opt = document.createElement('li');
        opt.setAttribute("class", "list-group-item");
        opt.setAttribute('data-pid', plist[index].id);
        opt.textContent = `${plist[index].name}`;
        opt.addEventListener('click', function(){
            document.getElementById('searchName').value = opt.textContent;
            let req = new XMLHttpRequest();
            req.open('GET', `/getPartsById?pid=${opt.getAttribute('data-pid')}`, true);
            req.addEventListener('load', function(){
                if(req.status >= 200 && req.status < 400){
                    console.log("Success: " + req.statusText);
                    document.getElementById('searchDisp').innerHTML = '';
                    let retPart = JSON.parse(req.responseText);
                    let arrayBuf = new Uint8Array(retPart[0].file.data);
                    let blob = new Blob([arrayBuf], {type: "image/png"});
                    let url = URL.createObjectURL(blob);
                    let p = document.createElement('img');
                    p.src = url;
                    p.setAttribute('data-pid', opt.getAttribute('data-pid'));
                    p.name = opt.textContent;
                    p.setAttribute('class', 'displayList');
                    displays(p);
                    searchDisp.appendChild(p);
                }
                else{
                    console.log("Error in network request: " + req.statusText);
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

//create search list and load monster by name
document.getElementById('searchMonsterName').addEventListener('input', function(){
    document.getElementById('searchMonsterNameList').innerHTML = '';
    let name = document.getElementById('searchMonsterName').value;
    req = new XMLHttpRequest();
    req.open('GET', `/getMonsterByName?name=${name}`, true);

    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            console.log(`Success: ${req.statusText}`);
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
            req.open('GET', `/getMonsterById?mid=${opt.value}`, true);
            req.addEventListener('load', function(){
                if(req.status >= 200 && req.status < 400){
                    console.log("Success: " + req.statusText);
                    document.getElementById('monName').setAttribute("data-mid", opt.value);
                    document.getElementById('monName').value =  opt.textContent;
                    document.getElementById('searchMonsterNameList').innerHTML = '';
                    let retParts = JSON.parse(req.responseText);
                    console.log([retParts]);
                    uniqueID = 0;
                    zCount = 0;
                    for(let m = 0; m < retParts.length; m++){
                        let arrayBuf = new Uint8Array(retParts[m].file.data);
                        let blob = new Blob([arrayBuf], {type: "image/png"});
                        let url = URL.createObjectURL(blob);
                        let addPart = document.createElement('img');
                        addPart.src = url;
                        addPart.setAttribute('data-pid', retParts[m].id_parts);
                        addPart.name = retParts[m].name;
                        uniqueID++;
                        zCount++;
                        addPart.style.zIndex = retParts[m].zIndex;
                        addPart.className = 'positionParts';
                        addPart.style.transform = `rotate(${retParts[m].orientation}deg)`;
                        addPart.style.width = `${retParts[m].size}%`;
                        addPart.style.left = `${retParts[m].xCoord}px`;
                        addPart.style.top = `${retParts[m].yCoord}px`;
                        let id = uniqueID;
                        addPart.setAttribute('data-id', uniqueID);
                        let tr = document.createElement('tr');
                        tr.setAttribute('scope', 'row');
                        let newRow = `<td data-pid="${addPart.getAttribute('data-pid')}">${addPart.name}</td><td><input type="number" data-type="partSize" data-id="${id}" min="5" max="100" value="${retParts[m].size}"></td><td><input type="number" data-type="pOrient" data-id="${id}" min="0" max="360" value="${retParts[m].orientation}"><td><input type="number" data-type="partZ" data-id="${id}" min="1" max="${zCount}" value="${addPart.style.zIndex}"></td><td><button class="deleteBtn" data-type="partDel" data-id="${id}">X</button></td>`;
                        tr.innerHTML += newRow;
                        controlTable.appendChild(tr);
                        assemblyFrame.appendChild(addPart);
                        freshDrags(addPart);
                        let zindexes = partTable.querySelectorAll("input[data-type='partZ']");
                        for(let z in zindexes){
                          zindexes[z].max = zCount;
                        }
                    }
                }
                makeChange();
            });
            req.send();
            searchList.innerHTML = '';
        });
        searchSelect.appendChild(opt);
    }
    searchList.appendChild(searchSelect);
    searchList.style.bottom += `${sl.offsetHeight}px`;
    searchList.style.left += `${sl.previousElementSibling.offsetWidth}px`;
}


// if user clicks away from list, remove list
document.body.addEventListener('click', function(event){
    if(event.target.parentElement.id != 'searchNameListUl'){
        document.getElementById('searchNameList').innerHTML = '';
    }
    if(event.target.parentElement.id != 'searchMonsterNameListUl'){
        document.getElementById('searchMonsterNameList').innerHTML = '';
    }
});

// load part images by type to into display pane
function displayPartsByType(){ 
    let pType = document.getElementById('searchType').value;
    let mine = document.querySelector('#myParts').checked;
    req = new XMLHttpRequest();
    req.open('GET', `/getAssemblyDisplayParts?pType=${pType}&mine=${mine}`, true); 
    
    req.addEventListener('load',function(){ 
        if(req.status >= 200 && req.status < 400){
            console.log("Success: " + req.statusText);
            document.getElementById('searchDisp').innerHTML = '';
            pArray = JSON.parse(req.responseText);
            for(let index = 0; index < pArray.length; index++){
                let arrayBuf = new Uint8Array(pArray[index].file.data);
                let blob = new Blob([arrayBuf], {type: "image/png"});
                let url = URL.createObjectURL(blob);
                let p = document.createElement('img');
                p.src = url;
                p.setAttribute('data-pid', pArray[index].id);
                p.name = pArray[index].name;
                p.setAttribute('class', 'displayList');
                displays(p);
                searchDisp.appendChild(p);
            }
        }
        else{
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send();
}
displayPartsByType();
document.getElementById('searchType').addEventListener('input', displayPartsByType);

//**** first save button
let sendAddress = 0;
let mid = 0;
// grabs elements from assembly frame and creates png
  document.getElementById('saveMo').addEventListener('click', event => {
    mid = document.getElementById('monName').getAttribute('data-mid');
    if(isNaN(mid)){
        sendAddress = "/saveMonster";
        document.getElementById('saveName').textContent = "Save this Monsterous Creation?!?";
        document.getElementById('saveCanvas').textContent = "Save Monster";
        runSave();
    }
    else{
        sendAddress = "/updateMonster";
        document.getElementById('saveName').textContent = "Update this Monsterous Creation?!?";
        document.getElementById('saveCanvas').textContent = "Update Monster";
        runSave();
    }

    function runSave(){
        let canv = document.getElementsByTagName('canvas')[0];
        let canvParent = document.getElementById('saveImage');
        if(canv){
          canvParent.removeChild(canv);
        }

        document.getElementById('saveMonsterModal').style.maxWidth = `${assemblyFrame.offsetWidth + 20}px`;
        document.getElementById('saveMonsterModal').style.height = `${assemblyFrame.offsetHeight + 20}px`;
        // create new canvas using html
        let newCanv = document.createElement('canvas');
        newCanv.setAttribute('width', assemblyFrame.offsetWidth);
        newCanv.setAttribute('height', assemblyFrame.offsetHeight);
        let ctx = newCanv.getContext('2d');
        let newSvg = document.createElement('svg');
        newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        newSvg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
        newSvg.setAttribute('xml:space', "preserve");
        newSvg.setAttribute('width', assemblyFrame.offsetWidth);
        newSvg.setAttribute('height', assemblyFrame.offsetHeight);
        // <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${assemblyFrame.offsetWidth}" height="${assemblyFrame.offsetHeight}">
        newSvg.innerHTML = `<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${assemblyFrame.innerHTML}</div></foreignObject>`
        let data = new XMLSerializer().serializeToString(newSvg);
        console.log(data);
        console.log([data]);
        let DOMURL = self.URL || self.webkitURL || self;
        let img = new Image();
        let svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
        let url = DOMURL.createObjectURL(svg);
        console.log(url);
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);
        }
        img.src = url;
        // html2canvas(document.getElementById("assemblyFrame"), {allowTaint: true, backgroundColor: null, width: assemblyFrame.offsetWidth, height: assemblyFrame.offsetHeight}).then(canvas => {
        document.getElementById('saveImage').appendChild(newCanv);
        // });
    }
  });

    //******* second save button
    // grabs all information on screen to go to DB
    document.getElementById('saveCanvas').addEventListener('click', event => {
        let mName = document.getElementById('monName').value;
        if(!mName){
            $('#saveMonster').modal('toggle');
            setTimeout(() => {$('#noName').modal('toggle');}, 500);
            return;
        }
        else{
            let pArr = 0;    
            let pics = assemblyFrame.getElementsByTagName('img');
            let table = document.getElementById('partTable');
            let pObjectArray = [];
            let pArr1 = table.getElementsByTagName('tr');
            for(let index = 0; index < pArr1.length; index++){
                let pObject = {};
                let p = pArr1[index].firstElementChild;
                pObject.id = p.getAttribute('data-pid');
                p = p.nextElementSibling.firstElementChild;
                pObject.size = p.value;
                p = p.parentElement.nextElementSibling.firstElementChild;
                pObject.orientation = p.value;
                p = p.parentElement.nextElementSibling.firstElementChild;
                pObject.zIndex = p.value;
                p = p.getAttribute('data-id');
                for(let i = 0; i < pics.length; i++){
                    if(p == pics[i].getAttribute('data-id')){
                        pObject.xCoord = pics[i].offsetLeft;
                        pObject.yCoord = pics[i].offsetTop;
                    }
                }
                pObjectArray.push(pObject);
                pArr = JSON.stringify(pObjectArray);
            }
            var canv = document.getElementsByTagName('canvas')[0];
            canv.toBlob(function(blob) {
                let fd = new FormData(); 
                fd.append('data',blob); //image will show up in req.files
                fd.append('name',mName); //key-value pairs that will show up in req.body.name
                fd.append('pArray',pArr);
                if(!isNaN(mid)){
                    fd.append('mid',mid); //this means update rather than save new
                }
                let req = new XMLHttpRequest();
                req.open('POST',sendAddress,true); 
                req.addEventListener('load',function(response){
                    if(req.status >= 200 && req.status < 400){
                        console.log(`Success: ${req.statusText}`);
                        mid = JSON.parse(req.responseText).mid;
                        document.getElementById('monName').setAttribute('data-mid', mid);
                        document.getElementById('monName').value = mName;
                        makeChange();
                        $('#saveMonster').modal('toggle');
                        setTimeout(() => {$('#saveSuccess').modal('toggle');}, 700);
                    }
                    else{
                        console.log(`Error in network request: ${req.statusText}`);
                    }
                });
                req.send(fd);
            });
        }
    });

    //create button to update name if name exists for current monster
    function makeChange(){
        let changeName = document.getElementById('updateNameButton');
        if(!changeName){
            let newButton = document.createElement('button');
            newButton.setAttribute('type', "button");
            newButton.setAttribute('class', "btn btn-primary col-md-2");
            newButton.setAttribute('id', "updateNameButton");
            newButton.textContent = "Change Name";
            let saveMo = document.getElementById('saveMo').parentElement.parentElement;
            saveMo.insertBefore(newButton, saveMo.childNodes[2]);
            updateName();
        }
    }

    function updateName(){
        document.getElementById('updateNameButton').addEventListener('click', event => {
            let mid = document.getElementById('monName').getAttribute('data-mid');
            let name = document.getElementById('monName').value;
            let req = new XMLHttpRequest();
            req.open('GET',`/updateMonsterName?mid=${mid}&name=${name}`,true); 
            req.addEventListener('load',function(response){
                if(req.status >= 200 && req.status < 400){
                    console.log(`Success: ${req.statusText}`);
                    mid = JSON.parse(req.responseText).mid;
                    document.getElementById('monName').setAttribute('data-mid', mid);
                    document.getElementById('monName').value = name;
                    $('#nameChange').modal('toggle');
                }
                else{
                    console.log(`Error in network request: ${req.statusText}`);
                }
            });
            req.send();
        });
    }
});
