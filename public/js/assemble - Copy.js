window.addEventListener('load', function(){

  var assemblyFrame = document.getElementById('assemblyFrame');
  let controlTable = document.getElementById('partTable');
  let partsArr = document.getElementsByClassName('positionParts');
//testing block
  // let partOne = document.createElement('img');
  // let partTwo = document.createElement('img');
  // let partThree = document.createElement('img');
  // partOne.src = '/img/blueSquare.png';
  // partOne.setAttribute('data-id', '1');
  // partOne.name = 'blueSquare';
  // partTwo.src = '/img/greenCircle.png';
  // partTwo.setAttribute('data-id', '2');
  // partTwo.name = 'greenCircle';
  // partThree.src = '/img/redTriangle.png';
  // partThree.setAttribute('data-id', '3');
  // partThree.name = 'redTriangle';
  let pArray = [/*partOne, partTwo, partThree*/];
//end testing block

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
      addPart.name = event.target.name;
      let id = uniqueID;
      addPart.setAttribute('data-id', uniqueID);
      let tr = document.createElement('tr');
      tr.setAttribute('scope', 'row');
      let newRow = `<td data-pid="${event.target.getAttribute('data-pid')}">${event.target.name}</td><td><input type="number" data-type="partSize" data-id="${id}" min="5" max="100" value="100"></td><td><input type="number" data-type="partZ" data-id="${id}" min="1" max="${zCount}" value="${zCount}"></td><td><button class="deleteBtn" data-type="partDel" data-id="${id}">X</button></td>`;
      // <td><input type="number" data-type="pOrient" data-id="${id}" min="0" max="360" value="0"></td>
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

  //this loop is for testing purposes for pre
  // for(let index = 0; index < pArray.length; index++){
  //   pArray[index].setAttribute('class', 'displayList');
  //   displays(pArray[index]);
  //   searchDisp.appendChild(pArray[index]);
  // }
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
                let ctx = document.createElement("canvas").getContext("2d");
                // // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                // console.log(`window.scrollY: ${window.scrollY}`);
                // console.log(`pageY: ${event.pageY}`);
                // console.log(`cur offsetTop: ${current.offsetTop}`);
                // console.log(`assemblyFrame top: ${assemblyFrame.getBoundingClientRect().top}`);
                let x = y = w = h = alpha = 0;
                x = event.pageX - current.offsetLeft - assemblyFrame.getBoundingClientRect().left;
                y = event.pageY - current.offsetTop - assemblyFrame.getBoundingClientRect().top  - window.scrollY;
                w = ctx.canvas.width = current.width;
                h = ctx.canvas.height = current.height;
                alpha = 0;
                if(current.id === "assemblyFrame"){
                        part = -1;
                        return;
                }
                //checking rotation
                // let cs = window.getComputedStyle(current);
                // if(cs.getPropertyValue('transform')){
                // let trans = cs.getPropertyValue('transform');
                
                // let tArr = trans.split('(')[1].split(')')[0].split(',');
                // let a = tArr[0];
                // let b = tArr[1];
                // let angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
                // console.log(`rotate(${angle}deg)`);
                // }
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
        shiftX = event.clientX - part.getBoundingClientRect().left + assemblyFrame.getBoundingClientRect().left;
        shiftY = event.clientY - part.getBoundingClientRect().top + assemblyFrame.getBoundingClientRect().top + window.scrollY;
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

    //orientation
    // if(event.target.getAttribute('data-type') == 'pOrient'){
    //   for(let part in partsArr){
    //     if(partsArr[part].getAttribute('data-id') == event.target.getAttribute('data-id')){
    //       partsArr[part].style.transform = `rotate(${event.target.value}deg)`;
    //       return;
    //     }
    //   }
    // }
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

// clear assembly space
document.getElementById('clearConfirm').addEventListener('click', event => {
    assemblyFrame.innerHTML = '';
    document.getElementById('partTable').innerHTML = '';
    document.getElementById('monName').setAttribute('data-mid', "alpha");
    document.getElementById('monName').value = '';
    uniqueID = 0;
    zCount = 0;
    $('#clearConfirmation').modal('toggle');
});

//**************************** DB block ********************************//

// create search list and display part by name
document.getElementById('searchName').addEventListener('keypress', function(){
    console.log('event registered');
    document.getElementById('searchNameList').innerHTML = '';
    let name = document.getElementById('searchName').value;
    let mine = document.querySelector('#myParts').checked;
    req = new XMLHttpRequest();
    req.open('GET', `/getPartsByName?name=${name}&mine=${mine}`, true);

    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            console.log(`Success: ${req.statusText}`);
            console.log([req.responseText]);
            let plist = JSON.parse(req.responseText);
            console.log([plist]);
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
    for(let index = 0; index < plist.length; index++){
        let opt = document.createElement('li');
        opt.setAttribute("class", "list-group-item");
        opt.setAttribute('value', plist[index].id);
        opt.textContent = `${plist[index].name}`;
        opt.addEventListener('click', function(){
            document.getElementById('searchName').value = opt.textContent;
            req1 = new XMLHttpRequest();
            req1.open('GET', `/getPartsById?pid=${opt.value}`, true);
            req1.addEventListener('load', function(){
                if(req1.status >= 200 && req1.status < 400){
                    console.log("Success: " + req1.statusText);
                    document.getElementById('searchDisp').innerHTML = '';
                    let retPart = JSON.parse(req1.responseText);
                    console.log([retPart]);
                    let arrayBuf = new Uint8Array(retPart[0].file.data);
                    let blob = new Blob([arrayBuf], {type: "image/png"});
                    let url = URL.createObjectURL(blob);
                    let p = document.createElement('img');
                    p.src = url;
                    p.setAttribute('data-pid', pArray[0].id);
                    p.name = pArray[0].name;
                    p.setAttribute('class', 'displayList');
                    displays(p);
                    searchDisp.appendChild(p);
                }
                else{
                    console.log("Error in network request: " + req.statusText);
                }
            });
            req1.send();
            searchList.innerHTML = '';
        });
        searchSelect.appendChild(opt);
    }
    searchList.appendChild(searchSelect);        
    searchList.firstElementChild.style.top = sl.style.top + sl.offsetTop;
    searchList.firstElementChild.style.left = sl.offsetLeft - sl.offsetWidth;
}

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
let mid = document.getElementById('monName').getAttribute('data-mid');
// grabs elements from assembly frame and creates png
  document.getElementById('saveMo').addEventListener('click', event => {
    console.log(`save init`);
    console.log(`mid: ${mid}`);
    if(isNaN(mid)){
        console.log(`NaN`);
        sendAddress = "/saveMonster";
        document.getElementById('saveName').textContent = "Save this Monsterous Creation?!?";
        document.getElementById('saveCanvas').textContent = "Save Monster";
        runSave();
    }
    else{
        console.log('is a number');
        sendAddress = "/updateMonster";
        document.getElementById('saveName').textContent = "Update this Monsterous Creation?!?";
        document.getElementById('saveCanvas').textContent = "Update Monster";
        runSave();
    }

    function runSave(){
        console.log('runSave');
        let canv = document.getElementsByTagName('canvas')[0];
        if(canv){
          let canvParent = document.getElementById('saveImage');
          canvParent.removeChild(canv);
        }

        document.getElementById('saveMonsterModal').style.maxWidth = `${assemblyFrame.offsetWidth + 20}px`;
        document.getElementById('saveMonsterModal').style.height = `${assemblyFrame.offsetHeight + 20}px`;
        html2canvas(document.getElementById("assemblyFrame"), {allowTaint: true, width: assemblyFrame.width, height: assemblyFrame.height}).then(canvas => {
        document.getElementById('saveImage').appendChild(canvas)
        });
    }
  });

    //******* second save button
    // grabs all information on screen to go to DB
    document.getElementById('saveCanvas').addEventListener('click', event => {
        let mName = document.getElementById('monName').value;
        console.log(`mName: ${mName}`);
        if(!mName){
            $('#saveMonster').modal('toggle');
            setTimeout(() => {$('#noName').modal('toggle');}, 500);
            return;
        }
        else{
            console.log('save start');
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
                pObject.zIndex = p.value;
                pObject.orientation = 0;  // this is where that would go
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
                console.log(`sendAddress: ${sendAddress}`);
                req.open('POST',sendAddress,true); 
                req.addEventListener('load',function(response){
                    if(req.status >= 200 && req.status < 400){
                        console.log(`Success: ${req.statusText}`);
                        mid = JSON.parse(req.responseText).mid;
                        document.getElementById('monName').setAttribute('data-mid', mid);
                        document.getElementById('monName').value = mName;
                        let changeName = document.getElementById('updateNameButton');
                        if(!changeName){
                            let newButton = document.createElement('button');
                            newButton.setAttribute('type', "button");
                            newButton.setAttribute('class', "btn btn-primary col-md-2");
                            newButton.setAttribute('id', "updateNameButton");
                            newButton.textContent = "Change Name";
                            let saveMo = document.getElementById('saveMo').parentElement;
                            saveMo.insertBefore(newButton, saveMo.childNodes[2]);
                            updateName();
                        }
                        $('#saveMonster').modal('toggle');
                        setTimeout(() => {$('#saveSuccess').modal('toggle');}, 500);
                    }
                    else{
                        console.log(`Error in network request: ${req.statusText}`);
                    }
                });
                req.send(fd);
            });
        }
    });

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