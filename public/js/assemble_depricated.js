window.addEventListener('load', function(){

  var assemblyFrame = document.getElementById('assemblyFrame');
  let partsTable = document.getElementById('partTable');
  let partsArr = document.getElementsByClassName('positionParts');
//testing block
  let partOne = document.createElement('img');
  let partTwo = document.createElement('img');
  let partThree = document.createElement('img');
  partOne.src = '/img/blueSquare.png';
  partOne.id = '1';
  partOne.name = 'blueSquare'
  partTwo.src = '/img/greenCircle.png';
  partTwo.id = '2';
  partTwo.name = 'greenCircle';
  partThree.src = '/img/redTriangle.png';
  partThree.id = '3';
  partThree.name = 'redTriangle';
//end testing block

//begin drag positioning block
partsArr = document.getElementsByClassName('positionParts');
  function freshDrags(){
  
  let part;
  let shiftX;
  let shiftY;
  for(var i = 0; i < partsArr.length; i++){
    (function(index){
      partsArr[index].addEventListener('mousedown', function (event){
        part = this;
        part.style.border = '1px dotted rgba(0,0,0,0.5)';
        shiftX = event.clientX - part.getBoundingClientRect().left + assemblyFrame.getBoundingClientRect().left;
        shiftY = event.clientY - part.getBoundingClientRect().top + assemblyFrame.getBoundingClientRect().top;
        assemblyFrame.append(part);
        moveAt(event.pageX, event.pageY);        

        assemblyFrame.addEventListener('mousemove', onMouseMove);

        part.ondragstart = function(){  //prevent default drag image behavior
          return false;
        }
      });
    })(i);
    }

    function onMouseMove(event){
          moveAt(event.pageX, event.pageY);
            let maxRight = assemblyFrame.getBoundingClientRect().left + assemblyFrame.offsetWidth - 5;
            let maxLeft = assemblyFrame.getBoundingClientRect().left + 5;
            let maxTop = assemblyFrame.getBoundingClientRect().top + 5;
            let maxBottom = assemblyFrame.getBoundingClientRect().top + assemblyFrame.offsetHeight - 5;
            if(event.pageX >= maxRight || event.pageX <= maxLeft || event.pageY <= maxTop || event.pageY >= maxBottom){
            console.log('here');
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
      console.log('mousup');
          if(part){
            assemblyFrame.removeEventListener('mousemove', onMouseMove);
            part.onmouseup = null;
            assemblyFrame.style.overflow = 'hidden';
            part.style.border = 'none';
          }
        });
  }
//end drag positioning block

//begin search display block
  var searchDisp = document.getElementById('searchDisp');
  var partTable = document.getElementById('partTable');
  let cloneOne = partOne.cloneNode(true);
  let cloneTwo = partTwo.cloneNode(true);
  let cloneThree = partThree.cloneNode(true);
  searchDisp.appendChild(cloneOne);
  searchDisp.appendChild(cloneTwo);
  searchDisp.appendChild(cloneThree);

  let zCount = 0;
  function displays(){
    for(var j = 0; j < searchDisp.children.length; j++){
    (function(index){
      searchDisp.children[index].addEventListener('click', function listen(event){
        var pic = this;
        zCount++;
        this.style.zIndex = zCount;
        this.className = 'positionParts';
        this.style.width = '100%';
        let tr = document.createElement('tr');
        tr.setAttribute('scope', 'row')
        let newRow = `<td>${this.name}</td><td><input type="number" data-type="partSize" data-id="${this.id}" min="5" max="100" value="100"></td><td><input type="number" data-type="partZ" data-id="${this.id}" min="1" max="${zCount}" value="${zCount}"></td><td><button class="deleteBtn" data-type="partDel" data-id="${this.id}">X</button></td>`;
        tr.innerHTML += newRow;
        partsTable.appendChild(tr);
        assemblyFrame.appendChild(this);
        this.removeEventListener('click', listen);
        freshDrags();
        let zindexes = partTable.querySelectorAll("input[data-type='partZ']");
        for(let z in zindexes){
          zindexes[z].max = zCount;
        }
      });
    })(j);
  }
  }
//end search display block

//begin parts table block
  partsTable.addEventListener('input', event => {
    console.log(event.target.nodeName);
    console.log(event.target.getAttribute('data-id'));

    //zindex
    if(event.target.getAttribute('data-type') == 'partZ'){
      for(let part in partsArr){
        if(partsArr[part].id == event.target.getAttribute('data-id')){
          let zprevious = Number(partsArr[part].style.zIndex);
          let zpost = event.target.value;
          partsArr[part].style.zIndex = zpost;
          let zindexes = partTable.querySelectorAll("input[data-type='partZ']");
          for(let part2 in partsArr){
            // console.log(`pInd: ${Number(partsArr[part2].style.zIndex)}, zpost: ${zpost}, zprev: ${zprevious}`);
            if(partsArr[part2].style.zIndex == zpost && partsArr[part2] != partsArr[part]){
              partsArr[part2].style.zIndex = zprevious;
              for(let z in zindexes){
                if(partsArr[part2].id == zindexes[z].getAttribute('data-id')){
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
        if(partsArr[part].id == event.target.getAttribute('data-id')){
          partsArr[part].style.width = `${event.target.value}%`;
        }
      }
    }
  });

  //delete part
  partsTable.addEventListener('click', event => {
    console.log(event.target.nodeName);
    if(event.target.nodeName == "BUTTON"){
      console.log('here');
      // let delArr = partTable.querySelectorAll("input[data-type='partZ']");
      // console.log(delArr);
      for(let n = 0; n < partsArr.length; n++){
        // console.log(`part: ${part}, partsID: ${partsArr[part].id}`)
        if(partsArr[n].id == event.target.getAttribute('data-id')){
          if(confirm(`Would you like to remove ${partsArr[n].name}?`)){
            // console.log(`part name: ${partsArr[part].name}`);
            let cloneZero = partsArr[n].cloneNode(true);
            cloneZero.style.width = "";
            cloneZero.style.top = "";
            cloneZero.style.left = "";
            cloneZero.style.zIndex = "";
            cloneZero.className = "";
            searchDisp.appendChild(cloneZero);
            let p = event.target.parentNode.parentNode;
            p.parentNode.removeChild(p);
            // partsArr[part].parentNode.removeChild(partsArr[part]);
            zCount--;
            // console.log(partsArr[part].name);
            for(let i = 0; i < partsArr.length; i++){
              // console.log(partsArr[part].style.zIndex);
              // console.log(partsArr[i].name);
              // console.log(partsArr[i].style.zIndex);
              if(Number(partsArr[i].style.zIndex) > Number(partsArr[n].style.zIndex)){
                // console.log(partsArr[i].name);
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
            // console.log(`pName1: ${partsArr[part].name}`);
            partsArr[n].parentNode.removeChild(partsArr[n]);
            // console.log(`pName2: ${partsArr[part].name}`);
            freshDrags();
            displays();
            for(let part in partsArr){
        console.log(`part${part}: ${partsArr[part].name}`)
      }
      console.log(partsArr);
            return;
          }
        }
      }
    }
  });

//end parts table block
  displays();
});