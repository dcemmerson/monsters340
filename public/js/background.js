var loggedInUserId; //used for client side verification to allow/not allow user to update monster-background comob
//additional checking is done server side so user cannot bypass button

var backgroundImages = [];
var monsterImages = [];



window.addEventListener('DOMContentLoaded', function(){
    getLoggedInUser();
    updateDropdowns();
    
    document.getElementById('filterByUser').addEventListener("click",function(event){
	
//remember size/location on assemblyFrame of selected monster to restore these properties after
//updating dropdown list
	let monster = document.getElementById('assemblyFrame').childNodes[0];
	var context = {};
	context.selectedIndex = monster.getAttribute("data-selectedIndex");
	context.monsterId = monster.getAttribute("data-monsterId");
	context.size = parseInt(monster.style.width);
	context.xCoord = parseInt(monster.style.left);
	context.yCoord = parseInt(monster.style.top);
	

	event.preventDefault();
	updateDropdowns(context,function reSelectIndex(){//restore properties to monster drawing and dropdown before user clicked 'filter'
  
//	    monsterImages[selectedIndex - 1]["data-size"] = size;
//	    monsterImages[selectedIndex - 1]["data-xCoord"]  =xCoord;
//	    monsterImages[selectedIndex - 1]["data-yCoord"] = yCoord;
	    $('#retrieveMonsterDropdown').ddslick('select',{index:context.selectedIndex}); 
	});
    });
    
    var assemblyFrame = document.getElementById('assemblyFrame');
    let controlTable = document.getElementById('partTable');
    let partsArr = document.getElementsByClassName('positionParts');

    //begin search display block
    let uniqueID = 0;
    let zCount = 0;

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
		if(current.getAttribute("data-type") == "background"){
		    part = current;
		    return;
		}

                let ctx = document.createElement("canvas").getContext("2d");
		
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
	    }//end of checkAlpha()
	    

	    checkAlpha(this);
	    
	    if(part.getAttribute("data-type") == "background")
		return;

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




    function updateDropdowns(prev,callback){

	$('#retrieveMonsterDropdown').ddslick('destroy');
	$('#retrieveBackgroundDropdown').ddslick('destroy');
	backgroundImages = [];
	monsterImages = [];
	

	let context = {};
	context.onlyMyBackgrounds = document.getElementById('onlyMyBackgrounds').checked;
	
	let req = new XMLHttpRequest();
	req.open('POST','/retrieveMonstersAndBackgrounds',true);
	req.setRequestHeader("content-type","application/json");
	req.addEventListener('load',function(response){    
	    let res = JSON.parse(response.currentTarget.responseText);

	    for(let i = 0; i < res.background.length; i++){
		if(res.background[i].file){
		    let arrayBuf = new Uint8Array(res.background[i].file.data);
		    let blob = new Blob([arrayBuf],{type:"image/png"});
		    
    		    let url = URL.createObjectURL(blob);
		   
		    backgroundImages.push({text: res.background[i].name,
					   value: res.background[i].id,
					   imageSrc: url,
					   description: " ",
					   "data-userId":res.background[i].userId,
					   "data-type":"background"//put in quotes to force
					   //ddslick to accept userId. We can extract by looking at
					   //selectData.selectData["data-userId"]
					  });
		    
		    
		    
		}
	    }
	    
	    let monsterDropdown = document.createElement("select");
//	    option = document.createElement("option")
//	    monsterDropdown.appendChild(option);
	    for(let i = 0; i < res.monster.length; i++){
		if(res.monster[i].file){
		    let arrayBuf = new Uint8Array(res.monster[i].file.data);
		    let blob = new Blob([arrayBuf],{type:"image/png"});
    		    let url = URL.createObjectURL(blob);
		    
		    if(prev && prev.monsterId == res.monster[i].id){
			monsterImages.push({text: res.monster[i].name,
					    value: res.monster[i].id,
					    imageSrc: url,
					    description: " ",
					    "data-userId":res.monster[i].userId,
					    "data-monsterId":prev.monsterId,
					    "data-backgroundId":res.monster[i].backgroundId,
					    "data-size":prev.size,
					    "data-xCoord":prev.xCoord,
					    "data-yCoord":prev.yCoord,
					    "data-type":"monster"
					   });
		    }
		    else{
			monsterImages.push({text: res.monster[i].name,
					    value: res.monster[i].id,
					    imageSrc: url,
					    description: " ",
					    "data-userId":res.monster[i].userId,
					    "data-monsterId":res.monster[i].id,
					    "data-backgroundId":res.monster[i].backgroundId,
					    "data-size":res.monster[i].size,
					    "data-xCoord":res.monster[i].xCoord,
					    "data-yCoord":res.monster[i].yCoord,
					    "data-type":"monster"
					   });
		    }
		}
	    }
	    
//	    document.getElementById("retrieveMonsterDropdown").appendChild(monsterDropdown);
//	    document.getElementById("retrieveBackgroundDropdown").appendChild(backgroundDropdown);
	    let monsterText;
	    if(monsterImages.length > 0) monsterText = "Choose a monstrous creation!";
	    else monsterText = "Go assemble some monsters or try filtering by all users";
	    $('#retrieveMonsterDropdown').ddslick({
		onSelected: function(selectedData){
		    displayMonster(selectedData,"monster");
		    //in case user selects through multiple backgrounds - reset bvalue in monster size each time
	    

		},//can add callback function
		data: monsterImages,
		height: 300,
		selectText: monsterText
		
	    });
	    $('#retrieveBackgroundDropdown').ddslick({
		selectText: "Choose monster first",
	    });


	    
	    if(document.getElementById('assemblyFrame').childNodes.length > 1){
		let selectedMonsterIndex;
		if(document.getElementById('assemblyFrame').childNodes[0].getAttribute("data-type") == "monster")
		    selectedMonsterIndex = document.getElementById('assemblyFrame').childNodes[0].getAttribute("data-selectedIndex");
		else
		    selectedMonsterIndex = document.getElementById('assemblyFrame').childNodes[1].getAttribute("data-selectedIndex");

		$('#retrieveMonsterDropdown').ddslick('select',{index:selectedMonsterIndex});
/*
		let numberOfMonsters = $('#retrieveMonsterDropdown')[0].childNodes[childNodeIndex].childNodes.length;
		let backgroundDropdownIndex = 1;
		for(let i = 1; i < numberOfMonsters + 1; i++){
		    
		    if(selectedData.selectedData["data-backgroundId"] == $('#retrieveBackgroundDropdown')[0].childNodes[1].childNodes[i].childNodes[0].firstElementChild.value){
			
			$('#retrieveBackgroundDropdown').ddslick('select',{index:i})
		    }
		}
*/
	    }//end of if(assemblyFrame)
	    
	    if(callback) callback();
	});//end of XHR
	
	req.send(JSON.stringify(context));

    }
    
    






    
    function displayMonster(selectedData){

	if(selectedData.selectedData.selected == false){
	    //clear out assembly frame
	    while(assemblyFrame.childNodes[0]){
		assemblyFrame.removeChild(assemblyFrame.childNodes[0]);
	    }
	    $('#retrieveBackgroundDropdown').ddslick('destroy');
	    $('#retrieveBackgroundDropdown').ddslick({
		selectText: "Choose monster first",
	    });
	}
	else{// selectedData.selectedIndex != 0
	    let assemblyFrame = document.getElementById("assemblyFrame");	
	    let addPart = new Image; 
	    let zIndex;
	    
	    //clear all background/monster
	    zIndex = 1;
	    while(assemblyFrame.childNodes[0]){
		assemblyFrame.removeChild(assemblyFrame.childNodes[0]);
	    }
	    
	    addPart.src = selectedData.selectedData.imageSrc;
	    addPart.className = "positionParts";
	    addPart.style.zIndex = zIndex;
	    addPart.style.width = `${selectedData.selectedData["data-size"]}%`;
	    addPart.style.left = selectedData.selectedData["data-xCoord"] + "px";
	    addPart.style.top = selectedData.selectedData["data-yCoord"] + "px";
	    
	    addPart.name = selectedData.selectedData.name;
	    

	    addPart.setAttribute("data-selectedIndex",selectedData.selectedIndex); //attribute to use when filtering backgrounds
	    addPart.setAttribute("data-monsterId",selectedData.selectedData["data-monsterId"]);

	    assemblyFrame.appendChild(addPart);
	    
	    
	    document.getElementById('increaseSize').value = selectedData.selectedData["data-size"];
	    //now check to see if(monster part) belongs to user and there is a monster on the canvas - enable save button
	    if(selectedData.selectedData["data-backgroundId"]){
		if(selectedData.selectedData["data-userId"] == loggedInUserId){
		    document.getElementById('saveCombo').disabled = false;
		}
		else{
		    document.getElementById('saveCombo').disabled = true;
		}
	    }
	    freshDrags(addPart);    	    
	    

	    //now update background dropdown, selected appropriate backgrounDropdown index, which will cause 
	    //background to bedisplayed
	    $('#retrieveBackgroundDropdown').ddslick('destroy');
	    $('#retrieveBackgroundDropdown').ddslick({
		onSelected: function(selectedData){
		    displayBackground(selectedData);
		},
		selectText: "Pair monster with a background",
		data: backgroundImages,
		height: 300
	    });
	    
	    let numberOfBackgrounds = $('#retrieveBackgroundDropdown')[0].childNodes[1].childNodes.length;
	    let backgroundDropdownIndex = 1;

	    //check if we can get background image info off dropdown list
	    let foundBackground = false;
	    for(let i = 1; i < numberOfBackgrounds; i++){
		
		if(selectedData.selectedData["data-backgroundId"] == $('#retrieveBackgroundDropdown')[0].childNodes[1].childNodes[i].childNodes[0].firstElementChild.value){
		    
		    $('#retrieveBackgroundDropdown').ddslick('select',{index:i})
		    foundBackground = true;
		}
	    }
	    
	    //if foundbackground = false, that means the selected monster is using a different user's background, 
	    //and the current user is filtering backgrounds by 'my backgrounds'
	    //send req to retrieve that background from db
	    if(foundBackground == false){
		var context = {};

		let req = new XMLHttpRequest();

		
		req.open('POST','/getSingleBackground',true); 
		req.setRequestHeader('content-type','application/json');
		
		req.addEventListener('load',function(response){
		    
		    if(req.status >= 200 && req.status < 400){
			let res = JSON.parse(response.currentTarget.response);

			if(res.background[0].file){
			    $('#retrieveBackgroundDropdown').ddslick('destroy');

			    let arrayBuf = new Uint8Array(res.background[0].file.data);
			    let blob = new Blob([arrayBuf],{type:"image/png"});
			    
    			    let url = URL.createObjectURL(blob);

			    document.getElementById('assemblyFrame').style.backgroundImage = `url(${url})`;

			    backgroundImages.push({text: res.background[0].name,
						   value: res.background[0].id,
						   imageSrc: url,
						   description: "Not my background",
						   "data-userId":res.background[0].userId,
						   "data-type":"background"//put in quotes to force
						   //ddslick to accept userId. We can extract by looking at
						   //selectData.selectData["data-userId"]
						  });
			    
			    
			    $('#retrieveBackgroundDropdown').ddslick({
				onSelected: function(selectedData){
				    displayBackground(selectedData);
				},
				selectText: "Pair monster with a background",
				data: backgroundImages,
				height: 300
			    });
			    $('#retrieveBackgroundDropdown').ddslick('select',{index:backgroundImages.length})
			    backgroundImages.pop();
			    
			}
			
		    } 
		});
		
		context.backgroundId = selectedData.selectedData["data-backgroundId"];
		
		req.send(JSON.stringify(context));
		
	    }




	    
	}
	
	

    }    //end of displayMonster
    
    

    function displayBackground(selectedData){
	let assemblyFrame = document.getElementById("assemblyFrame");		
	
	assemblyFrame.style.backgroundImage = `url()`;
	
	if(selectedData.selectedIndex != 0){
    
	    assemblyFrame.style.backgroundImage = `url(${selectedData.selectedData.imageSrc})`;
	    assemblyFrame.style.backgroundRepeat = "no-repeat";
	    assemblyFrame.style.backgroundPosition = "center";
	    assemblyFrame.style.backgroundSize = "contain";
	}
	
	

    }    //end of displayBackground














    
//event listener to dynamically update size of monster image as user changes numbers
    document.getElementById('increaseSize').addEventListener('input',function(input){
	document.getElementById('assemblyFrame').childNodes[0].style.width = document.getElementById('increaseSize').value + "%";

    });


    //**** first save button
    let sendAddress = 0;
    let mid = 0;
    // grabs elements from assembly frame and creates png
    document.getElementById('saveCombo').addEventListener('click', event => {
	if(validSelections()){

            sendAddress = "/updateMonsterBackgroundCombo";
            document.getElementById('saveName').textContent = "Keep these together??";
            document.getElementById('saveCanvas').textContent = "Update";


	    runSave();

	    $('#saveMonster').modal('toggle');
	    
	    function runSave(){
		let canv = document.getElementsByTagName('canvas')[0];
		if(canv){
		    let canvParent = document.getElementById('saveImage');
		    canvParent.removeChild(canv);
		}
		
		document.getElementById('saveMonsterModal').style.maxWidth = `${assemblyFrame.offsetWidth + 20}px`;
		document.getElementById('saveMonsterModal').style.height = `${assemblyFrame.offsetHeight + 20}px`;
		html2canvas(document.getElementById("assemblyFrame"), {allowTaint: true, backgroundColor: null, width: assemblyFrame.width, height: assemblyFrame.height}).then(canvas => {
		    document.getElementById('saveImage').appendChild(canvas);
		});
	    }	
	}
    });

    //******* second save button
    // grabs all information on screen to go to DB
    document.getElementById('saveCanvas').addEventListener('click', event => {

        let selectedMonsterId = document.getElementsByClassName('dd-option-selected')[0];
	selectedMonsterId = parseInt(selectedMonsterId.querySelector('input').value);
	let selectedBackgroundId = document.getElementsByClassName('dd-option-selected')[1];
	selectedBackgroundId = parseInt(selectedBackgroundId.querySelector('input').value);
	
	//get coordinate offsets of monster
	let assemblyFrame = document.getElementById('assemblyFrame');
	
	let xCoordMo = assemblyFrame.childNodes[0].offsetLeft;
	let yCoordMo = assemblyFrame.childNodes[0].offsetTop;

	let sizeMo = parseInt(assemblyFrame.childNodes[0].style.width);
	
        let context = {};
	context.monsterId = selectedMonsterId;
	context.backgroundId = selectedBackgroundId;
	context.xCoordMo = xCoordMo;
	context.yCoordMo = yCoordMo;
	context.sizeMo = sizeMo;

        let req = new XMLHttpRequest();
	req.open('POST',sendAddress,true); 
        req.setRequestHeader("content-type","application/json");
	req.addEventListener('load',function(response){

	    //after successful save, update the backgroundId fk attribute for monster dropdown.
	    //this has already been changed in db, and we do not want to re-pull all monsters/backgrounds
	    //from db as this takes several seconds, so we will dynamically update page to match db.
	    if(req.status >= 200 && req.status < 400){

		//destroy old dropdown, update monsterImages array of objects and remake ddslick
		$('#retrieveMonsterDropdown').ddslick('destroy');
		$('#retrieveBackgroundDropdown').ddslick('destroy');

		document.getElementById("increaseSize").value = "";

		for(let i = 0; i < monsterImages.length; i++){
		    if(monsterImages[i].value == context.monsterId){
			monsterImages[i]["data-backgroundId"] = context.backgroundId;
			monsterImages[i]["data-size"] = context.sizeMo;
			monsterImages[i]["data-xCoord"] = context.xCoordMo;
			monsterImages[i]["data-yCoord"] = context.yCoordMo;
		    }
		}

		$('#retrieveMonsterDropdown').ddslick({
		    onSelected: function(selectedData){
			displayMonster(selectedData,"monster");
		    },//can add callback function
		    data: monsterImages,
		    height: 300,
		    selectText: "Choose a monstrous creation!"
		    
		});
		$('#retrieveBackgroundDropdown').ddslick({
		    selectText: "Choose monster first",
		});
                $('#saveMonster').modal('toggle');
                setTimeout(() => {$('#saveSuccess').modal('toggle');}, 700);	
		
		zIndex = 1;
		while(assemblyFrame.childNodes[0]){
		    assemblyFrame.removeChild(assemblyFrame.childNodes[0]);
		}
		assemblyFrame.style.backgroundImage = "url()";
		
		
	    }
	    
	    
	    /*                
			      document.getElementById('monName').setAttribute('data-mid', mid);
			      document.getElementById('monName').value = mName;
			      makeChange();
			      $('#saveMonster').modal('toggle');
			      setTimeout(() => {$('#saveSuccess').modal('toggle');}, 700);
			      }
			      else{
			      console.log(`Error in network request: ${req.statusText}`);
			      }
	    */
        });
        req.send(JSON.stringify(context));
	
    });
});



function validSelections(){
    let assemblyFrame = document.getElementById("assemblyFrame");
    
    if(!assemblyFrame.childNodes[0] || assemblyFrame.style.backgroundImage.slice(4,-1).replace(/"/g,"") == ""){
	$(function () {
	    $('#saveCombo').popover()
	});
	
	//set required attributes for popover on update button
	let saveComboButton = document.getElementById("saveCombo");
	saveComboButton.setAttribute("data-placement","top");
	saveComboButton.setAttribute("data-toggle","popover");
	saveComboButton.setAttribute("data-content","Must choose both monster and background");

	$('#saveCombo').popover('show');

	//now 
	setTimeout(function(){
	    $('#saveCombo').popover('dispose');
	}, 5000);
	setTimeout(function(){ //delay required to restore data-toggle modal - want to give shorter delay in
	    //case user quickly selects correct type followed by update again, so button works correctly
	    saveComboButton.setAttribute("data-toggle","modal");	
	},10);
	
	return false;
    }
    else
	return true;
}


function getLoggedInUser(){
        
    let req = new XMLHttpRequest();
    req.open('GET','/getUserId',true); 
    
    req.addEventListener('load',function(response){
	
	if(req.status >= 200 && req.status < 400){

	    loggedInUserId = JSON.parse(response.currentTarget.response).loggedInUserId;
	} 
    });
    req.send();
    
}

/*
//getIndividualBackground only used if user has backgrounds filtered by "my backgrounds"
//but the selected monster requires a background that belongs to different user
function getSingleBackground(selectedData){
    var context = {};

    let req = new XMLHttpRequest();

    
    req.open('POST','/getSingleBackground',true); 
    req.setRequestHeader('content-type','application/json');
    
    req.addEventListener('load',function(response){
	
	if(req.status >= 200 && req.status < 400){
	    let res = JSON.parse(response.currentTarget.response);

	    if(res.background[0].file){
		$('#retrieveBackgroundDropdown').ddslick('destroy');

		let arrayBuf = new Uint8Array(res.background[0].file.data);
		let blob = new Blob([arrayBuf],{type:"image/png"});
		
    		let url = URL.createObjectURL(blob);

		document.getElementById('assemblyFrame').style.backgroundImage = `url(${url})`;

		backgroundImages.push({text: res.background[0].name,
				       value: res.background[0].id,
				       // imageSrc: url,
				       description: "Not my background - filter by all users",
				       "data-userId":res.background[0].userId,
				       "data-type":"background"//put in quotes to force
				       //ddslick to accept userId. We can extract by looking at
				       //selectData.selectData["data-userId"]
				      });
		
		
		$('#retrieveBackgroundDropdown').ddslick({
		    onSelected: function(selectedData){
			displayBackground(selectedData);
		    },
		    selectText: "Pair monster with a background",
		    data: backgroundImages,
		    height: 300
		});
		$('#retrieveBackgroundDropdown').ddslick('select',{index:backgroundImages.length})
		
	    }
	    
	} 
    });
    
    context.backgroundId = selectedData.selectedData["data-backgroundId"];
    
    req.send(JSON.stringify(context));
    
}*/
/*************************************************************************************/
