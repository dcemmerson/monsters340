//global variables used for updating parts/backgrounds.
//used to display old part/background name and type to user
//in addition to being used to validate user's update
//input. User is not allowed to update a part type from background
//to torso/arm/head/etc, or vice-versa - that wouldnt make sense
var oldName;
var oldType;




window.addEventListener('DOMContentLoaded', function(){
    updatePartsDropdown();
    updateBackgroundsDropdown();
    let context = document.getElementById('monsterCanvas').getContext("2d");
    
    //vars for addClick
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint = false;
    var mousedown = false;

    var erase = false;
    var curColor;
    var clickColor = new Array();

    //marker size vars
    var clickSize = new Array();
    var curSize = 5;

    //mouse button down, start recording motion
    $('#monsterCanvas').mousedown(function(event){
	curColor = document.getElementById('chooseColor').value;
	mousedown = true;
	let mouseX = event.pageX - this.offsetLeft - this.parentElement.parentElement.offsetLeft;
	let mouseY = event.pageY - this.offsetTop - this.parentElement.parentElement.offsetTop;

	paint = true;
	if(erase != true){
	addClick(event.pageX - this.offsetLeft - this.parentElement.parentElement.offsetLeft,event.pageY - this.offsetTop - this.parentElement.parentElement.offsetTop);
	redraw();
	}
	else{
	    eraseRect(event.pageX - this.offsetLeft - this.parentElement.parentElement.offsetLeft,event.pageY - this.offsetTop - this.parentElement.parentElement.offsetTop);
	}
    });


    $('#monsterCanvas').mousemove(function(event){
	if(paint && erase != true){
	    addClick(event.pageX - this.offsetLeft - this.parentElement.parentElement.offsetLeft,event.pageY - this.offsetTop - this.parentElement.parentElement.offsetTop, true);
	    redraw();
	}
	else if(erase == true && mousedown == true){
	    eraseRect(event.pageX - this.offsetLeft - this.parentElement.parentElement.offsetLeft,event.pageY - this.offsetTop - this.parentElement.parentElement.offsetTop);
	}
    });

     //mouse button up, stop recording
    $('#monsterCanvas').mouseup(function(event){
	paint = false;
	mousedown = false;
	document.getElementById('monsterCanvas').toBlob(function(blob){
	    let tempImage = new Image(); //document.createElement('img');
	    tempImage.onload = function(){
		context.drawImage(tempImage,0,0);
		URL.revokeObjectURL(url);
	    }

	    let url = URL.createObjectURL(blob);
	    tempImage.src =  url;
	    context.clearRect(0, 0, context.canvas.width, context.canvas.height); //clear canvas

	    clickX = [];
	    clickY = [];
	    clickDrag = [];
	    clickColor = [];
	    clickSize = [];
    
	});

    });

    //mouse leaves the canvas, stop recording
    $('#monsterCanvas').mouseleave(function(event){
	paint = false;
    })
    
    function eraseRect(x,y){
	context.clearRect(x - (curSize / 2),y - (curSize / 2),curSize,curSize);
    }

    //addClick saves the position of the click
    function addClick(x, y, dragging){
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
	clickColor.push(curColor);
	clickSize.push(curSize);

    }

    //redraw clears the canvas and redraws everything
    function redraw(){
//	context.clearRect(0, 0, context.canvas.width, context.canvas.height) //this clears the canvas first
	
	for(let i=0; i < clickX.length; i++){
	    context.beginPath();
	    if(clickDrag[i] && i){
		context.moveTo(clickX[i - 1], clickY[i - 1]);
	    }
	    else{
		context.moveTo(clickX[i], clickY[i]);
	    }
	    context.lineTo(clickX[i], clickY[i]);
	    context.closePath();
	    context.lineJoin = "round";
	    context.strokeStyle = clickColor[i];
	    context.lineWidth = clickSize[i];
	    context.stroke();
	}
    }
    
    context.restore();


    //clear canvas button
    document.getElementById('clearCanvas').addEventListener('click', () => {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height)
	clickX.length = 0;
	clickY.length = 0;
	clickDrag.length = 0;
	clickColor.length = 0;
	clickSize.length = 0;
    });


    document.getElementById('colorErase').addEventListener('click', () => {
	//context.globalCompositeOperation = 'destination-out';
	if(erase == false){
	    erase = true;
	    //disable all the other icons except +/- buttons
	    document.getElementById('monsterCanvas').style.cursor = 'not-allowed';
	    document.getElementById('colorErase').setAttribute("class","btn btn-warning active");
	    document.getElementById('saveCanvas').setAttribute("disabled","true");
	    document.getElementById('clearCanvas').setAttribute("disabled","true");
	    document.getElementById('chooseColor').setAttribute("disabled","true");
	}
	else{
	    erase = false;
	    document.getElementById('monsterCanvas').style.cursor = 'default';
	    document.getElementById('colorErase').setAttribute("class","btn btn-warning");
	    document.getElementById('saveCanvas').disabled = false;
	    document.getElementById('clearCanvas').disabled = false;
	    document.getElementById('chooseColor').disabled = false;
	    
	}
    });
    //size picker
    document.getElementById('decreaseSize').addEventListener('click', () => {
	if(curSize >= 2){
	    curSize -= 2;
	    document.getElementById('samplePaintSize').style.width = `${curSize * 2}%`;
	}
    });
    document.getElementById('increaseSize').addEventListener('click', () => {
	if(curSize <= 50){
	    curSize += 2;
	    document.getElementById('samplePaintSize').style.width = `${curSize * 2}%`;
	}
    });

    //button in hidden save modal
    document.getElementById("saveCanvas").addEventListener("click",function(event){
	//event.preventDefault();
	saveCanvas(context);
    });
    //button in hidden update modal
    document.getElementById("updateCanvas").addEventListener("click",function(event){
	//event.preventDefault();
	saveCanvas(context,"update");
    });
    //when save part is clicked, grab canvas and append inside div as image element
    document.getElementById("savePa").addEventListener("click",function(event){
	canvasToModalSave();
    });
    //when save part is clicked, grab canvas and append inside div as image element
    document.getElementById("updatePa").addEventListener("click",function(event){
	canvasToModalUpdate();
    });

    document.getElementById("retrievePart").addEventListener("click",function(event){
	event.preventDefault();
	retrievePart(context);
	if(document.getElementById("retrievePartDropdown").selectedIndex !=0)
	    document.getElementById("updatePa").disabled = false;
	else
	    document.getElementById("updatePa").disabled = true;
    });    
    document.getElementById("retrieveBackground").addEventListener("click",function(event){
	event.preventDefault();
	retrieveBackground(context);
	if(document.getElementById("retrieveBackgroundDropdown").selectedIndex !=0)
	    document.getElementById("updatePa").disabled = false;
	else
	    document.getElementById("updatePa").disabled = true;
    });    

    document.getElementById("deletePart").addEventListener("click",function(event){
	deletePart();
    });
    document.getElementById("deleteBackground").addEventListener("click",function(event){
	deleteBackground();
    });
});//window listener


/**********************************End of Window Event Listener**************************/

/*********************************Functions used for modals******************************/
//canvasToModalSave grabs the canvas, converts it to a link, and then appends to the
//save modal popup
function canvasToModalSave(){
    if(document.getElementById('inputName').value == '' || document.getElementById('inputName').value == ' ' || document.getElementById('inputName').value == '  '){
	$(function () {
	    $('#savePa').popover()
	});
	
	//set required attributes for popover on update button
	let savePaButton = document.getElementById("savePa");
	savePaButton.setAttribute("data-placement","top");
	savePaButton.setAttribute("data-toggle","popover");
	savePaButton.setAttribute("data-content","Argh! Give this part or background a name!");
	
	$('#savePa').popover('show');
	
	//now 
	setTimeout(function(){
	    $('#savePa').popover('dispose');
	}, 3500);
	setTimeout(function(){ //delay required to restore data-toggle modal - want to give shorter delay in
	    //case user quickly selects correct type followed by update again, so button works correctly
	    savePaButton.setAttribute("data-toggle","modal");	
	},10);
	
    }
    else{
	let tempImage = document.getElementById("tempImageSave");

	//get rid of old modal images, if they exist
	if(tempImage){
	    document.getElementById("saveImage").removeChild(tempImage);
	}

	//display user's part name input in modal section before user save image to db
	let saveName = document.getElementById("saveName");
	saveName.innerHTML = document.getElementById("inputName").value;
	saveName.innerHTML += " (" 
	    + document.getElementById("inputType")[document.getElementById("inputType").selectedIndex].innerHTML 
	    + ")";



	var canvas = document.getElementById('monsterCanvas');
	canvas.toBlob(function(blob) {
	    
	    let imageUrl = URL.createObjectURL(blob);
	    let newImg = document.createElement('img');
	    newImg.setAttribute("id","tempImageSave");
	    newImg.onload = function() {
		URL.revokeObjectURL(imageUrl);	    // no longer need to read the blob so it's revoked

	    };
	    newImg.src = imageUrl;
	    document.getElementById("saveImage").appendChild(newImg);
	    
	});
    }
}
function canvasToModalUpdate(){
    if(document.getElementById('inputName').value == '' || document.getElementById('inputName').value == ' ' || document.getElementById('inputName').value == '  '){
	$(function () {
	    $('#updateePa').popover()
	});
	
	//set required attributes for popover on update button
	let updatePaButton = document.getElementById("updatePa");
	updatePaButton.setAttribute("data-placement","top");
	updatePaButton.setAttribute("data-toggle","popover");
	updatePaButton.setAttribute("data-content","Argh! Give this part or background a name!");
	
	$('#updatePa').popover('show');
	
	//now 
	setTimeout(function(){
	    $('#updatePa').popover('dispose');
	}, 3500);
	setTimeout(function(){ //delay required to restore data-toggle modal - want to give shorter delay in
	    //case user quickly selects correct type followed by update again, so button works correctly
	    savePaButton.setAttribute("data-toggle","modal");	
	},10);
	
    }
    else{
	
	
	let inputType = document.getElementById('inputType');
	
	
	//verify user is not trying to update a background to part, or vice-versa
	if(oldType == "background" && inputType[inputType.selectedIndex].innerHTML != "background"){
	    //then we cannot update and need to display message to user
	    addPopover("Cannot update type 'background' to type 'part' (arm/head/etc). Change type to 'background' or select 'Save As'.");
	}
	else if(oldType != "background" && inputType[inputType.selectedIndex].innerHTML == "background"){
	    //then we cannot update and need to display message to user
	    addPopover("Cannot update type 'part' (arm/head/etc) to type 'background'. Change type to 'arm', head', etc, or select 'Save As'.");
	}
	else{
	    
	    let tempImage = document.getElementById("tempImage");
	    
	    //get rid of old modal images, if they exist
	    if(tempImage){
		document.getElementById("updateImage").removeChild(tempImage);
	    }
	    
	    //display user's part name input in modal section before user updates/update image to db
	    let updateName = document.getElementById("updateName");
	    updateName.innerHTML = "Update to: ";
	    updateName.innerHTML += document.getElementById("inputName").value;
	    updateName.innerHTML += " (" 
		+ document.getElementById("inputType")[document.getElementById("inputType").selectedIndex].innerHTML 
		+ ")";
	    let oldInfo = document.getElementById("oldInfo");
	    oldInfo.innerHTML = "From: ";
	    oldInfo.innerHTML += oldName + " (" + oldType + ")";
	    
	    
	    var canvas = document.getElementById('monsterCanvas');
	    canvas.toBlob(function(blob) {
		
		let imageUrl = URL.createObjectURL(blob);
		let newImg = document.createElement('img');
		newImg.setAttribute("id","tempImage");
		newImg.onload = function() {
		    URL.revokeObjectURL(imageUrl);	    // no longer need to read the blob so it's revoked
		    
		};
		newImg.src = imageUrl;
		document.getElementById("updateImage").appendChild(newImg);
		
	    });
	}//end of else statement
    }
}
/********************************End of modal functions**********************************/

/********************************Popover functions***************************************
 These popovers are used if user tries to update a part from background to head/arm/etc, 
or vice versa, as these are separate entities and that would not be allowed
*****************************************************************************************/
function addPopover(message){
//enable popover on the update button
    $(function () {
	$('#updatePa').popover()
    });
    
    //set required attributes for popover on update button
    let updateButton = document.getElementById("updatePa");
    updateButton.setAttribute("data-placement","top");
    updateButton.setAttribute("data-toggle","popover");
    updateButton.setAttribute("data-content",message);

    $('#updatePa').popover('show');

    //now 
    setTimeout(function(){
	$('#updatePa').popover('dispose');
    }, 5000);
    setTimeout(function(){ //delay required to restore data-toggle modal - want to give shorter delay in
	//case user quickly selects correct type followed by update again, so button works correctly
	updateButton.setAttribute("data-toggle","modal");	
    },10);


}



/*******************************End of popover functions********************************/

/****************************************************************************************/
/***********************************AJAX Requests****************************************/
/***************************************************************************************/
function updatePartsDropdown(){
    let partsDropdown = document.getElementById("retrievePartDropdown");
    
    //clear dropdown of all values
    while(partsDropdown.firstChild){
	partsDropdown.removeChild(partsDropdown.firstChild);
    }
    

    req = new XMLHttpRequest();
    req.open('GET','/getAllPartNames',true); 
    
    req.addEventListener('load',function(response){    
	let res = JSON.parse(response.currentTarget.responseText);
	let option;
	option = document.createElement("option");
	option.innerHTML = '';
	partsDropdown.appendChild(option);

	for(let i = 0; i < res.length; i++){
	    option = document.createElement("option");
	    option.value = res[i].id;
	    option.innerHTML = res[i].name;
	    partsDropdown.appendChild(option);
	}
    });	

    req.send();
}
function updateBackgroundsDropdown(){
    let backgroundsDropdown = document.getElementById("retrieveBackgroundDropdown");
    
    //clear dropdown of all values
    while(backgroundsDropdown.firstChild){
	backgroundsDropdown.removeChild(backgroundsDropdown.firstChild);
    }
    
    req = new XMLHttpRequest();
    req.open('GET','/getAllBackgroundNames',true); 
    
    req.addEventListener('load',function(response){    
	let res = JSON.parse(response.currentTarget.responseText);
	let option;
	option = document.createElement("option");
	option.innerHTML = '';
	backgroundsDropdown.appendChild(option);

	for(let i = 0; i < res.length; i++){
	    if(res[i].id != 1){
		option = document.createElement("option");
		option.value = res[i].id;
		option.innerHTML = res[i].name;
		backgroundsDropdown.appendChild(option);
	    }
	}
    });	

    req.send();    
}

function retrievePart(context){
    let partId = document.getElementById("retrievePartDropdown").value;
    
    req = new XMLHttpRequest();
    req.open('GET','/retrievePart?partId=' + partId,true); 
    

    
    req.addEventListener('load',function(response){    
	let res = JSON.parse(response.currentTarget.response);

	let arrayBuf = new Uint8Array(res.file.data);
	let blob = new Blob([arrayBuf],{type:"image/png"});

	let img = new Image();
	img.onload = function(){
	    context.clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
	    context.drawImage(img,0,0); //now draw image from url
	    URL.revokeObjectURL(url);
	    
	    
	}
	
	let url = URL.createObjectURL(blob);
	img.src = url;
	document.getElementById('inputName').value = oldName = res.name; //oldName used if user selects update btn
	document.getElementById('inputType').selectedIndex = res.type - 1;
	oldType = document.getElementById('inputType')[document.getElementById('inputType').selectedIndex].innerHTML;///onyl used if user selects update btn
	document.getElementById('inputId').value = res.id; //hidden field to keep track of partId for update query
    });	
    
    req.send();
}
function retrieveBackground(context){
    let backgroundId = document.getElementById("retrieveBackgroundDropdown").value;
    
    req = new XMLHttpRequest();
    req.open('GET','/retrieveBackground?backgroundId=' + backgroundId,true); 
    

    
    req.addEventListener('load',function(response){    
	let res = JSON.parse(response.currentTarget.response);

	let arrayBuf = new Uint8Array(res.file.data);
	let blob = new Blob([arrayBuf],{type:"image/png"});

	let img = new Image();
	img.onload = function(){
	    context.clearRect(0, 0, context.canvas.width, context.canvas.height); //clear canvas
	    context.drawImage(img,0,0); //now draw image from url
	    URL.revokeObjectURL(url);
	    
	    
	}
	
	let url = URL.createObjectURL(blob);
	img.src = url;
	document.getElementById('inputName').value = oldName = res.name; //oldName only used for update query
	document.getElementById('inputType').selectedIndex = 6;
	oldType = document.getElementById('inputType')[document.getElementById('inputType').selectedIndex].innerHTML;///only used if user selects update btn
	document.getElementById('inputId').value = res.id; //hidden field to keep track of backgroundId for update query
    });	
    
    req.send();
}

//function is used for both save as and update queries
function saveCanvas(context,update){

    type = document.getElementById("inputType").value;
    name = document.getElementById("inputName").value;
    
    var canvas = document.getElementById('monsterCanvas');
    canvas.toBlob(function(blob) {
	let fd = new FormData(); //image will show up in req.files
	fd.append('data',blob);
	fd.append('type',type); //key-value pairs that will show up in req.body.type
	fd.append('name',name); //key-value pairs that will show up in req.body.name


	req = new XMLHttpRequest();
	if(update){//we need to send part/background to db via update route
	    let id = document.getElementById("inputId").value
	    fd.append('id',id);
	    //if background is selected option in dropdown, we need to save canvas to background table
	    if(type == "background"){

		req.open('POST','/updateBackground',true);

		req.addEventListener('load',function(response){
		    document.getElementById('monsterCanvas').getContext("2d").clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
		    document.getElementById('inputName').value = '';
		    //updatePartsDropdown();
		    updateBackgroundsDropdown();
		});
		
	    }
	    else{
		req.open('POST','/updatePart',true); 

		req.addEventListener('load',function(response){
		    document.getElementById('monsterCanvas').getContext("2d").clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
		    document.getElementById('inputName').value = '';
		    updatePartsDropdown();
		    
		});
		
		
	    }  	
	    
	}
	else{//we need to send part or background to db as new part/background

	    //if background is selected option in dropdown, we need to save canvas to background table
	    if(type == "background"){
		req.open('POST','/sendBackgroundToDatabase',true);

		req.addEventListener('load',function(response){
		    document.getElementById('monsterCanvas').getContext("2d").clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
		    document.getElementById('inputName').value = '';
		    //	    updatePartsDropdown();
		    updateBackgroundsDropdown();
		});
		
	    }
	    else{
		req.open('POST','/sendPartToDatabase',true); 
		//		req.responseType = "blob";	
		req.addEventListener('load',function(response){
		    document.getElementById('monsterCanvas').getContext("2d").clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
		    document.getElementById('inputName').value = '';
		    updatePartsDropdown();
		    
		});
		
		
	    }  	
	    

	}
	req.send(fd);
    });//end of canvasToBlob callback
    
}

function deletePart(){
    let context = document.getElementById('monsterCanvas').getContext("2d");
    let partId = document.getElementById("retrievePartDropdown").value;
    req = new XMLHttpRequest();
    req.open('GET','/deletePart?partId=' + partId,true); 
    
    req.addEventListener('load',function(response){    
	document.getElementById('monsterCanvas').getContext("2d").clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
	document.getElementById('inputName').value = '';
	updatePartsDropdown();
    });	
    
    req.send();
    
}
function deleteBackground(){
    let context = document.getElementById('monsterCanvas').getContext("2d");
    let backgroundId = document.getElementById("retrieveBackgroundDropdown").value;
    req = new XMLHttpRequest();
    req.open('GET','/deleteBackground?backgroundId=' + backgroundId,true); 
    
    req.addEventListener('load',function(response){    
	document.getElementById('monsterCanvas').getContext("2d").clearRect(0, 0, context.canvas.width, context.canvas.height) //clear canvas
	document.getElementById('inputName').value = '';
	updateBackgroundsDropdown();
    });	
    
    req.send();
    
}
