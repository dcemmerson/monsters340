const ROOT = '/monsters';
let bodyParser = require('body-parser');
let path = require('path');
let mysql = require('./dbcon.js');
let fs = require('fs');

var express = require('express');
let app = express();
let hbs = require('express-handlebars').create({
    defaultLayout: 'main',
    extname: 'hbs',
    layoutDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`
});

let multer = require('multer');
let upload = multer();


//login/authentication 
var auth = require('./auth'); //module located in ./auth.js that is used to check if user is logged in. Login page is rendered if user not logged in.
var session = require('express-session');
var bcrypt = require('bcrypt'); //used to hash password - adds workload when hashing
const saltRounds = 10; //Used to determine server workload when hashing passwords
app.use(session({
    secret: "superSecretPassword",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        path: '/',
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }

}));


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('port', 10000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static('public'));
//app.use('/', require('./queries.js'))

let cssFile;
app.get(`/css/${cssFile}`, function(req,res){
    res.send(`/css/${cssFile}`);
    res.end;
});
let jsFile;
app.get(`/js/${jsFile}`, function(req,res){
    res.send(`/js/${jsFile}`);
    res.end();
});
let imgFile;
app.get(`/img/${imgFile}`, function(req,res){
    res.send(`/img/${imgFile}`);
    res.end();
});


// query functions
let limitPerPage = 8; // constant for gallery page limit
//*************************** Begin Get Query Function Block ****************//

// getPartNames fetches all the part types for use in selection drop down lists
// no requirements
function getPartNames(res, mysql, context, complete){
  mysql.pool.query(`SELECT id, type_name from part_types`, function(error, results, fields){
      if(error){
	  console.log(error);
	  res.write(JSON.stringify(error));
	  res.end();
    }
    context.partType = results;
    complete();
  });
}

// getUserPartsDraw fetches id and name for all parts made by user
// requires user id
// draw page: fill dropdown options to continue edits
function getUserPartsDraw(res, mysql, context, uid, complete){
    let sql = `SELECT id, name FROM parts WHERE userId = ?`;
    let insert = [uid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.userParts = results;

        complete(results);
    });
}
// getPartTypeId fetches id for all part types
// requires part-type name
// sql subquery - use to fulfill sql foreign constraints
function getPartTypeId(res, mysql, context, type_name, complete){
    let sql = `SELECT id FROM part_types WHERE type_name = ?`;

    let insert = [type_name];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.typeId = results[0].id;

        complete(results);
    });
}


// getUserPartsByTypeDraw fetches id and name for parts made by the user of a type
// requires user id, drop down choice "type"
// draw page: filter to fill dropdown to continue edits
function getUserPartsByTypeDraw(res, mysql, context, type, uid, complete){
    let sql = `SELECT id, name from parts where userId = ? and type = ?`;
    let insert = [uid, type];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.results = results;
        complete();
    });
}

// getPartByName fetches one part with the name specified by the user
// requires user id, text box entry "name"
// draw page: return part to continue edits
// assembly page: return thumbnail of part to place onto monster
function getPartByName(res, mysql, context, name, uid, complete){
    let sql = 0;
    let insert = 0;
    if(isNaN(uid)){
        sql = 'select id, name, type, file from parts where name = ?';
        insert = [name];
    }
    else{
        let sql = `SELECT id, name, type, file from parts where userId = ? and name = ?`;
        let insert = [uid, name];
    }
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.results = results;
        complete();
    });
}

// searchPartByName fetches all parts with the name attributes
// requires an id value, and name value
// assembly page: return list of names like name value
function searchPartByName(res, mysql, context, name, uid, complete){
    let sql = 0;
    let insert = 0;
    name = `%${name}%`;
    if(isNaN(uid)){
//        console.log(`ifuserID: ${uid}`);
        sql = 'select id, name from parts where name like ? limit 20';
        insert = [name];
    }
    else{
//        console.log(`elseuserID: ${uid}`);
        sql = 'select id, name from parts where userId = ? and name like ? limit 20';
        insert = [uid, name];
    }
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
//        console.log(results);
        complete(results);
    });
}

// getPartInfoById fetches one part with the id specified by the user
// requires valid id in parts table
// draw page: return part to continue edits
// assembly page: return thumbnail of part to place onto monster --- nope
function getPartById(res, mysql, context, partId, complete){
    let sql = `SELECT id, name, type, file FROM parts WHERE id=?`;
    let insert = [partId];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
//	console.log(results);
        complete(results);
    });
}

// getPartListByType fetches all parts of type
// requires drop down choice "type"
// assembly page: thumbnail as options to place onto monster
function getPartListByType(res, mysql, context, type, complete){
    let sql = `SELECT id, name, type, file from parts where type = ?`;
    let insert = [type];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        complete(results);
    });
}

// getUserPartListByType fetches all parts made by user of type
// requires user id, drop down "type" and check box "my parts = true"
// assembly page: thumbnail only user's parts as options to place onto monster
function getUserPartListByType(res, mysql, context, type, uid, complete){
    let sql = `SELECT id, name, type, file from parts where userID = ? and type = ?`;
    let insert = [uid, type];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        complete(results);
    });
}

// getMonsterList fetches previously saved images of monster
// requires user id
// assembly page: thumbnail list of monsters to choose for continued editing
function getMonsterList(res, mysql, context, uid, complete){
    let sql = `SELECT id, name, file from monster where userId = ?`;
    let insert = [uid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.results = results;
        complete();
    });
} 

// getMonsterAssemblyByName fetches all parts assigned to monster by name of monster
// requires text box entry "name" of monster
// assembly page: reassemble for continued editing
function getMonsterAssemblyByName(res, mysql, context, name, complete){
    let sql = `SELECT m.id AS mid, m.name AS mname, p.id AS pid, p.name AS pname, p.type AS type, p.file AS file, mp.xCoord AS xCoord, mp.yCoord AS yCoord, mp.zIndex AS zIndex FROM monster m INNER JOIN monster_parts mp ON m.id = mp.id_monster INNER JOIN parts p ON mp.id_parts = p.id WHERE m.name = ? GROUP BY mp.zIndex ASC`;
    let insert = [name];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.results = results;
        complete();
    });
}

// searchMonsterByName fetches all monsters with the name attributes
// requires an id value, and name value
// assembly page: return list of names like name value
function searchMonsterByName(res, mysql, context, uid, name, complete){
    name = `%${name}%`;
    let sql = 'select id, name from monster where userId = ? and name like ? limit 10';
    let insert = [uid, name];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
//        console.log([results]);
        complete(results);
    });
}

// getMonsterAssemblyById fetches all parts assigned to monster by monster id
// requires id of monster (returns id)
// assembly page: reassemble for continued editing
function getMonsterAssemblyById(res, mysql, context, mid, complete){
    let pCount = 0;
    let sql = `SELECT id_parts, size, orientation, zIndex, xCoord, yCoord FROM monster_parts mp WHERE id_monster = ? GROUP BY mp.zIndex ASC`;
    let insert = [mid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        pCount = results.length;
        for(let i = 0; i < results.length; i++){
            sql = 'SELECT name, file FROM parts WHERE id = ?';
            insert = [results[i].id_parts];
            mysql.pool.query(sql, insert, function(err, res, flds){
                if(err){
                    res.write(JSON.stringify(err));
                    res.end();
                }
                results[i].name = res[0].name;
                results[i].file = res[0].file;
                finished();
            });
        }
        function finished(){
            pCount--;
            if(pCount == 0){
                complete(results);
            }
        }
    });
}

// getMonsterListBackground fetches saved images of monster and background
// requires user id
// background page: thumbnail of monster with background option for editing
//                  **ready for user clientside
function getMonsterListBackground(res, mysql, context, uid, complete){
    let sql = `SELECT m.id as mid, m.name as mname, m.file as mfile, b.id as bid, b.name as bname, b.file as bfile from monster m inner join background b on m.backgroundId = b.id where userID = ?`;
    let insert = [uid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.results = results;
        complete();
    });
}

// getMonsterCount counts the total number of monsters
// requires uid (can be alpha to count all monsters)
// gallery page: count totals to establish max pages
function getMonsterCount(res, mysql, context, complete){
    let sql = 'select COUNT(`id`) as mTotal FROM monster';    
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
	    	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }

        complete(results);
    });
}

function getUserMonsterCount(res, mysql, uid, context, complete){
    let sql = 'select count(id) as mTotal from monster where userId=?';
    let insert = [uid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        complete(results);
    });
}

// getMonsterGallery fetches all finalized monsters
// requires a page number
// gallery page: thumbnail of monsters in backgrounds (compiled clientside)
function getMonsterGallery(res, mysql, page, context, complete){
    let sql = `SELECT * FROM (SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser,ROW_NUMBER() OVER (ORDER BY m.name ASC) AS RowNum FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id) as Results WHERE RowNum>? AND RowNum<=?`;
    let insert = [(page-1)*limitPerPage, (page-1)*limitPerPage + limitPerPage];
//    console.log(`insert: ${[insert]}`);
    // let sql = 'SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id';
    mysql.pool.query(sql, insert, function(error, results, fields){
	if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
	    res.end();
    }
    // console.log(`fields: ${[fields]}`);
	complete(results);
  });
}

// getUserMonsterGallery fetches all user's finalized monsters
// requires user id, check box "my monsters = true"
// gallery page: thumbnail of user's monsters only in background (comiled clientside)
function getUserMonsterGallery(res, mysql, uid, page, context, complete){
    let sql = `SELECT * FROM (SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser,ROW_NUMBER() OVER (ORDER BY m.name ASC) AS RowNum FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id WHERE m.userId=?) as Results WHERE RowNum>? AND RowNum<=?`;
    let insert = [uid, (page-1)*limitPerPage, (page-1)*limitPerPage + limitPerPage];
    mysql.pool.query(sql, insert, function(error, results, fields){
	if(error){
	    console.log(error);
      res.write(JSON.stringify(error));
      res.end();
    }
//    console.log(`results: ${results[0].userName}`);
    complete(results);
  });
}


function getSingleGalleryById(res, mysql, mid, context, complete){
    let sql = 'SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id WHERE m.id=?';
    let insert = [mid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    	    console.log(error);
            res.write(JSON.strigify(error));
            res.end();
        }
        complete(results);
    });
}

//getUserId fetches fetches id primary key from username
//requires username and then if that username exists, sets context.userId = id
function getUserId(res, mysql, context, username, complete){
    let sql = `SELECT id FROM user WHERE username = ?`;
    let values = [username];
    
    mysql.pool.query(sql, values, function(err, results, fields){
	if(err){
	    console.log(err);
	    return;
	}

	
	if(results[0]){
	    context.userId = results[0].id;
	    
	}
	complete(err,results,fields);
    });
}
//getUserId fetches fetches id primary key from username
//requires id and then context.userId = password - encrypted
function getUserPassword(res, mysql, context, id,complete){
    let sql = `SELECT password FROM user WHERE id = ?`;
//    console.log(id);
 
    let values = [id];
    
    mysql.pool.query(sql, values, function(err, results, fields){
	if(err){
	    console.log(err);
	    return;
	}
	complete(results[0].password);
    });
}

// getUserBackgroundsDraw fetches id and name for all parts made by user
// requires user id
// draw page: fill dropdown options to continue edits
function getUserBackgroundsDraw(res, mysql, context, uid, complete){
    let sql = `SELECT id, name FROM background where userId = ?`;
    let insert = [uid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.userBackgrounds = results;

        complete(results);
    });
}

// getBackgroundById fetches one background with the id specified by the user
// requires valid id in background table
// draw page: return background to continue edits
// background page: return background to display behind monster
// ????????assembly page: return thumbnail of part to place onto monster --- nope????????
function getBackgroundById(res, mysql, context, backgroundId, complete){
    let sql = `SELECT id, name, file FROM background WHERE id=?`;
    let insert = [backgroundId];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        complete(results);
    });
}
// getMonsterById fetches one background with the id specified by the user
// requires valid id in monster table
// background page: return monster to overlay over background
function getMonsterById(res, mysql, context, monsterId, complete){
    let sql = `SELECT id, name, file, userId, backgroundId FROM monster WHERE id=?`;
    let insert = [monsterId];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        complete(results);
    });
}

// ******************* Queries Used on MyCreations Page ************************* //
/*
//getAllMonstersAndBackgrounds retrieves all monsters and backgrounds.
//It is used to update the dropdown menus on myCreations page
function getAllMonstersAndBackgrounds(res, mysql, context, complete){
    
    let sql = `SELECT m.id AS monsterId, m.userId, m.name AS monsterName, m.backgroundId, m.file AS monsterFile,
    m.size, m.xCoord, m.yCoord, b.name AS backgroundName, b.file AS backgroundFile 
    FROM monster m 
    INNER JOIN background b ON m.backgroundId=b.id`;
    
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
	
	context.monsterBackground = [];
	
	for(let i = 0; i < results.length; i++){
	    context.monsterBackground.push({
		"monsterId":results[i].monsterId,
		"monsterName":results[i].monsterName,
		"monsterUserId":results[i].userId,
		"monsterFile":results[i].monsterFile,
		"monsterSize":results[i].size,
		"monsterXCoord":results[i].xCoord,
		"monsterYCoord":results[i].yCoord,
		"backgroundId":results[i].backgroundId,
		"backgroundName":results[i].backgroundName,
		"backgroundFile":results[i].backgroundFile
	    });
	    
	}
	console.log(context);
        complete();
    });
}
//getMyMonstersAndBackgrounds retrieves only logged in user's monsters and backgrounds.
//It is used to update the dropdown menus on myCreations page
function getMyMonstersAndBackgrounds(res, mysql, context, userId, complete){
    
    let sql = `SELECT m.id AS monsterId, m.userId, m.name AS monsterName, m.backgroundId, m.file AS monsterFILE,
    m.size, m.xCoord, m.yCoord, b.name AS backgroundName, b.file AS backgroundFile 
    FROM monster m 
    INNER JOIN background b ON m.backgroundId=b.id
    WHERE m.userId=?`;
    
    let insert = [userId];

    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
	
	context.monsterBackground = [];
	
	for(let i = 0; i < results.length; i++){
	    context.monsterBackground.push({
		"monsterId":results[i].monsterId,
		"monsterName":results[i].monsterName,
		"monsterUserId":results[i].userId,
		"monsterFile":results[i].monsterFile,
		"monsterSize":results[i].size,
		"monsterXCoord":results[i].xCoord,
		"monsterYCoord":results[i].yCoord,
		"backgroundId":results[i].backgroundId,
		"backgroundName":results[i].backgroundName,
		"backgroundFile":results[i].backgroundFile
	    });
	    
	}
	console.log(context);
        complete();
    });
}
*/

function getAllBackgrounds(res, mysql, context, complete){

    let sql = `SELECT id, name, file, userId FROM background`;
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
            res.end();
        }
	
	context.background = [];
	
	for(let i = 0; i < results.length; i++){
	    context.background.push({
		"id":results[i].id,
		"name":results[i].name,
		"userId":results[i].userId,
		"file":results[i].file
	    });
	    
	}
	complete();
    });
}

//getMyBackgrounds retrieve the names/ids for logged in user's backgrounds
//It is used to update the dropdown menus on myCreations page
function getMyBackgrounds(res, mysql, context, userId, complete){

    let sql = `SELECT id, name, userId, file FROM background WHERE userId=?`;
    let insert = [userId];
    mysql.pool.query(sql,insert, function(error, results, fields){
        if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
            res.end();
        }
	
	context.background = [];

	for(let i = 0; i < results.length; i++){
	    context.background.push({
		"id":results[i].id,
		"name":results[i].name,
		"userId":results[i].userId,
		"file":results[i].file
	    });
	}
	
	
        complete();
    });
}

//getAllMonstersNamesAndIds retrieves the names/id for all monsters
//It is used to update the dropdown menus on myCreations Page.
function getAllMonsters(res, mysql, context, complete){
    let sql = `SELECT id, name, userId, backgroundId, size, xCoord, yCoord, file FROM monster`;
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
            res.end();
        }

	context.monster = [];
	for(let i = 0; i < results.length; i++){
	    context.monster.push({
		"id":results[i].id,
		"name":results[i].name,
		"userId":results[i].userId,
		"backgroundId":results[i].backgroundId,
		"size":results[i].size,
		"xCoord":results[i].xCoord,
		"yCoord":results[i].yCoord,
		"file":results[i].file
	    });
	 
	}

	
        complete();
    });
}

//getMyMonstersNamesAndIds retrieves the names/id for logged in user's monsters
//It is used to update the dropdown menus on myCreations Page.
function getMyMonsters(res, mysql, context, userId, complete){
    let sql = `SELECT id, name, userId, backgroundId, size, xCoord, yCoord, file FROM monster WHERE userId=?`;
    let insert = [userId];

    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
	
	context.monster = [];
	for(let i = 0; i < results.length; i++){
	    context.monster.push({
		"id":results[i].id,
		"name":results[i].name,
		"userId":results[i].userId,
		"backgroundId":results[i].backgroundId,
		"size":results[i].size,
		"xCoord":results[i].xCoord,
		"yCoord":results[i].yCoord,
		"file":results[i].file
	    });
	}
		
	
        complete();
    });
}

//getSingleBackground retrieves just a single background.
//It is used to update the dropdown menus on myCreations Page.
function getSingleBackground(res, mysql, context, backgroundId, complete){
    let sql = `SELECT id, name, userId, file FROM background WHERE id=?`;
    let insert = [backgroundId];
    mysql.pool.query(sql,insert, function(error, results, fields){
        if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
            res.end();
        }
	
	context.background = [];

	for(let i = 0; i < results.length; i++){
	    context.background.push({
		"id":results[i].id,
		"name":results[i].name,
		"userId":results[i].userId,
		"file":results[i].file
	    });
	}
	
	
        complete();
    });
}

//updateMonsterBackground sets the fk reference in the monster table, along with size,
//xCoord, and yCoord
function updateMonsterBackground(req,res,mysql,context,userId,monsterId,backgroundId,size,xCoord,yCoord,complete){
    if(userId != req.session.userId){
//	console.log(userId);
//	console.log(req.session.userId);
	res.end();//this will only be used if user illegally messed with client side code -they are on their own at that point!
    }
    else{
	let sql = `UPDATE monster SET backgroundId=?,size=?,xCoord=?,yCoord=? WHERE id=?`;
	let insert = [backgroundId,size,xCoord,yCoord,monsterId];
	
	mysql.pool.query(sql, insert,  function(error,results,flds){
            if(error){
		console.log(error);
		res.write(JSON.stringify(err));
                res.end();
            }
	  
            complete(results.changedRows);
        });
	
	
    }

}

// ****************** End Queries Used on MyCreations Page ********************* //

//****************** End Get Query Function Block ************************//



//****************** Begin Insert Query Function Block ************************//

function insPart(res, mysql, context, name, typeId, blob, uid, complete){
    let sql = `INSERT INTO parts (name,type,file,userId) VALUES (?,?,?,?)`;
    let insert = [name, typeId, blob, uid];
    mysql.pool.query(sql, insert, function(error, results, fields){
	if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
	    res.end();
    }
    context.results = results;

    complete();
  });
}

// insBackground inserts a new background
// requires user id, background name and blob
// from draw page
function insBackground(res, mysql, context, name, blob, uid, complete){
    let sql = `INSERT INTO background (name, file, userID) VALUES (?,?,?)`;
    let insert = [name, blob, uid];

    mysql.pool.query(sql, insert, function(error, results, fields){
    if(error){
	console.log(error);
	res.write(JSON.stringify(error));
	res.end();
    }
    context.results = results;
    complete();
  });
}

// insMonster inserts a new monster
// requires monster name and blob
// requires user id, parts array with id, xCoord, yCoord, zIndex
function insMonster(res, mysql, context, name, blob, pArray, uid, complete){
    let mid;
    let count = 0;
    let sql = `INSERT INTO monster (name, userId, file) VALUES (?,?,?)`;
    let insert = [name, uid, blob];
   
//    console.log(insert);
//    console.log(sql);
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
            res.end();
        }
        //new monster id

//        console.log(`monster insert results: ${results}`);
        mid = results.insertId;        
        context.mid = results.insertId;


        sql = `insert into monster_parts (id_monster, id_parts, size, orientation, zIndex, xCoord, yCoord) values ?`;
        for(let p = 0; p < pArray.length; p++){
            pArray[p] = [mid].concat(pArray[p]);
        }
//        console.log([pArray]);
        mysql.pool.query(sql, [pArray], function(err,rsl,flds){
            if(error){
		console.log(error);
		res.write(JSON.stringify(err));
                res.end();
            }
//            console.log(rsl.affectedRows);
            complete(rsl);
        });
    });
}

//insUser adds a new user to user table
//requires firstname, lastname, username, password
//insUser calls getUserId to check if username already exists. If exists,
function insUser(res, context, firstname, lastname, username, password, complete){

    getUserId(res, mysql, context, username, hashThenInsert);

    function hashThenInsert(err,results,fields){
	if(err){
	    console.log(err);
	    return;
	}
	else if(results.length > 0){
	    context.userAlreadyExists = true; //handlebars will insert message to user on webpage if flag is set
	    res.render('createAccount',context);
	}
	else{
	    hashPassword(res, context, password, insUserStatement);
	    
	    function insUserStatement(err,hash){
		if(err){
		    console.log(err);
		return;
		}
		
		let insertStatement = `INSERT INTO user (firstName,lastName,username,password) VALUES (?,?,?,?)`;
		var values = [
		    firstname,
		    lastname,
		    username,
		    hash
		];  
		
		mysql.pool.query(insertStatement,values,function(err,results){
		    if(err){
		    console.log(err);
			return;
		    }
		    complete();
		});
	    };
	};
    }
}
//hash password function used by insUser()
function hashPassword(res, context, password, complete){
    bcrypt.hash(password, saltRounds, function(err, hash){
	complete(err,hash);
    });
}

//****************** End Insert Query Function Block ************************//

//****************** Begin Update Query Function Block ************************//
//updatePart() updates blob, name, and type of part
//requires blob, name, type (id)
//draw page: changed drawing and/or changed name or type
function updatePart(res, mysql, context, name, typeId, blob, uid, partId, complete){
    let sql = `UPDATE parts SET name=?,type=?,file=?,userId=? WHERE id=?`;
    let insert = [name, typeId, blob, uid, partId];
    mysql.pool.query(sql, insert, function(error, results, fields){
    if(error){
	console.log(error);
	res.write(JSON.stringify(error));
	res.end();
    }
    context.results = results;
    complete();
  });
}

//updateBackground() updates blob, name, and type of part
//requires blob, name, type (id)
//draw page: changed drawing and/or changed name or type
function updateBackground(res, mysql, context, name, blob, uid, backgroundId, complete){
    let sql = `UPDATE background SET name=?,file=?,userId=? WHERE id=?`;
    let insert = [name, blob, uid, backgroundId];

    mysql.pool.query(sql, insert, function(error, results, fields){
	if(error){
	    console.log(error);
	    res.write(JSON.stringify(error));
	    res.end();
    }
    context.results = results;
    complete();
  });
}


// updateMonsterName changes monster name
// requires monster id, name
// assembly page: changed monster name
function updateMonsterName(res, mysql, context, mid, name, complete){
    let sql = `UPDATE monster SET name=? WHERE id=?`;
    let insert = [name, mid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.nameResults = results;
        complete();
    });
}

// updateMonsterBlob updates the blob of a monster
// requires monster id, blob
// assembly page: change monster blob
function updateMonsterBlob(res, mysql, context, mid, blob, complete){
    let sql = `UPDATE monster SET file=? WHERE id=?`;
    let insert = [blob, mid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        context.blobResults = results;
        complete();
    });
}


// updateMonsterParts updates parts associated with monster
// requires monster id, parts array with id, xCoord, yCoord, zIndex
// assembly page:
function updateMonsterParts(res, mysql, context, mid, pArray, complete){
    let sql = `DELETE FROM monster_parts WHERE id_monster=?`; //remove previous associations
    let insert = [mid];
    mysql.pool.query(sql, insert, function(error, results, fields){
        if(error){
	    console.log(error);
            res.write(JSON.stringify(error));
            res.end();
        }
        sql = `INSERT INTO monster_parts (id_monster, id_parts, size, orientation, zIndex, xCoord, yCoord) VALUES ?`;
        for(let p in pArray){
            pArray[p] = [mid].concat(pArray[p]);
        }
        mysql.pool.query(sql, [pArray], function(err, res, flds){
            if(err){
		console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }
            context.partsResults = results;
            complete();
        });
    });
}

//****************** End Update Query Function Block ************************//

//****************** DELETE Query Function Block ************************//
// deletePart() deletes part from parts table
// requires part id
// draw page: make selection from dropdown and select delete part
function deletePart(res,mysql,context,partId,complete){
    let sql = `DELETE FROM parts WHERE id=?`
    let insert = [partId];

    mysql.pool.query(sql,insert,function(err){
	if(err){
	    console.log(err);
	    return;
	}
	else{
	    complete();
	}
    });
}
// deleteBackground() deletes background from background table
// requires background id
// draw page: make selection from dropdown and select delete background
function deleteBackground(res,mysql,context,backgroundId,complete){
    let sql = `DELETE FROM background WHERE id=?`
    let insert = [backgroundId];

    mysql.pool.query(sql,insert,function(err){
	if(err){
	    console.log(err);
	    return;
	}
	else{
	    complete();
	}
    });
}

//****************** End DELETE Query Function Block ************************//

//******************* Misc Functions ************************************//
//comparePasswords() takes two strings - one has already been encrypted using brcypt() and the 
//second was just entered by client. bcrypt.compare() is used to determine if passwords match
function comparePasswords(password,encryptedPassword,context,req,res){
    bcrypt.compare(password,encryptedPassword,function(err,response){
        if(err){
            console.log(err);
            context.invalid = true;
	    context.layout = 'loginLayout';
            res.render('login',context);
        }
        if(response){//successful
	    req.session.userId = context.userId;
            req.session.loggedIn = true;
            res.redirect(`${ROOT}/home`);
        }
        else{
            context.invalid = true;
	    context.layout = 'loginLayout';
            res.render('login',context);
        }
    });

}

//*********************** End of Misc Functions *************************//


//****************** Static Pages Block ******************************//
//******************Render page routes*********************************//
//login page
app.get('/', function(req,res){
    if(req.session.loggedIn) res.redirect(`${ROOT}/home`) 
    else{
	context = [];
	context.title = 'Monster340';
	context.layout = 'loginLayout';
	context.script = ['login.js'];
	res.render('login', context);
    }
});
app.get('/withoutCredentials', function (req, res, next) {
    var password = 'password';
    var context = {};
    getUserId(res,mysql,context,'anonymous',getAndComparePasswords);
    
    function getAndComparePasswords(err,results,fields){
	if(results[0]) getUserPassword(res,mysql,context,results[0].id,compPass);
	else{
	    context.invalid = true;
	    context.layout = 'loginLayout';
	    res.render('login',context);
	}
	function compPass(results){
	    if(results) comparePasswords(password,results,context,req,res);
	    else{
		context.invalid = true;
		context.layout = 'loginLayout';
		res.render('login',context);
	    }
	    
	}
    }
});
app.post('/login', function (req, res, next) {
    var password = req.body.password;
    var context = {};
    if(req.body.userName == '' || req.body.password == ''){
	context.invalid = true;
	context.layout = 'loginLayout';
	res.render('login',context);
    }
    else{
	getUserId(res,mysql,context,req.body.userName,getAndComparePasswords);
	
	function getAndComparePasswords(err,results,fields){
	    if(results[0]) getUserPassword(res,mysql,context,results[0].id,compPass);
	    else{
		context.invalid = true;
		context.layout = 'loginLayout';
		res.render('login',context);
	    }
	    function compPass(results){
		if(results) comparePasswords(password,results,context,req,res);
		else{
		    context.invalid = true;
		    context.layout = 'loginLayout';
		    res.render('login',context);
		}
		
	    }
	}
    }

});
app.get('/logout', function (req, res, next) {
    req.session.loggedIn = false;
    req.session.destroy();
    res.redirect(`${ROOT}/`);
});
//route used just to return logged in user's id client client side privilege checking...
//need to actually perform privilege checking on client-side still, but client side
//checking just used for 
app.get('/getUserId', function (req, res, next) {
    let context = {};
    context.loggedInUserId = req.session.userId;
    res.send(context);
});

//createAccount page linked to the homepage login
app.get('/createAccount', function(req,res){
  context = [];
  context.title = 'Create Account!';
  context.layout = 'loginLayout';
  res.render('createAccount', context);
});

//draw page
app.get('/draw',auth, function(req,res){
    let callbackCount = 0;
    context = {};
   context.drawParts = true;
    context.title = 'Draw Parts';
    context.script = ["canvas.js", "colors.js", "colorPicker.data.js", "colorPicker.js", "jsColor.js", "defColors.js"];
    getPartNames(res, mysql, context, complete);
    getUserPartsDraw(res, mysql, context, req.session.userId, complete);
    getUserBackgroundsDraw(res, mysql, context, req.session.userId, complete);

    function complete(){
        callbackCount++;
        if(callbackCount >= 3){
            res.render('draw', context);
        }
    }
});
//login page
app.get('/home',auth , function(req,res){
    context = [];
    context.home = true;
    context.title = 'Monster Home';
    context.script = ["home.js"];
    res.render('home', context);
});
//assembly page
app.get('/assembly',auth, function(req,res){
    let callbackCount = 0;
    context = {};
    context.assembly = true;
    context.title = 'Assemble a Monster';
    context.script = ["assemble.js", "html2canvas.min.js"];
    getPartNames(res, mysql, context, complete);
    getUserPartListByType(res, mysql, context, '1', req.session.userId, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 2){
            res.render('assembly', context);
        }
    }
});

//user creation page - user can pair monsters with backgrounds
app.get('/background',auth, function(req,res){
  context = [];
    context.background = true;
  context.title = 'Habitats';
  context.script = ["background.js","html2canvas.min.js"];
  res.render('background', context);
});

// gallery page for viewing completed creations
app.get('/gallery',auth, function(req,res){
  context = [];
    context.gallery = true;
  context.title = 'Monster Ball';
  context.script = ["gallery.js"];
  res.render('gallery', context);
});
/**************************** End Static Page Block ***********************/



/********************************Routes used on draw page*******************************/

//take asynch req from part drawing canvas save button and store the incoming blob in the database part table.
//Then, retrieve all blobs in the part database table and send them back to the client-side to update part
//dropdown on draw page.
app.post('/sendPartToDatabase',auth,upload.any(),function(req,res,next){

    var context = {};
    
    //extract string from req and cut out the quotes from each item
    var type_name = req.body.type;

    var name = req.body.name;
    
    insPart(res,mysql,context,name,type_name,req.files[0].buffer,req.session.userId,complete);
    
    function complete(){
	   res.end();
    }
    
});
//take asynch req from part drawing canvas save button and store the incoming blob in the database background table.
//THe incoming request is filtered on client side to decide whether to send blob to parts table or here to the
//background table
app.post('/sendBackgroundToDatabase',auth,upload.any(),function(req,res,next){

    var context = {};
    
    //extract string from req and cut out the quotes from each item
    var name = req.body.name;
    
    insBackground(res,mysql,context,name,req.files[0].buffer,req.session.userId,complete);

    function complete(){
	   res.end();
    }
    
});

//used on draw page to populate dropdown - returns just the names and id s of all parts in db.
//no required parameters in route
app.get('/getAllPartNames', function(req,res){
    var context = [];
    getUserPartsDraw(res,mysql,context,req.session.userId,sendBackPartsDraw);
    
    function sendBackPartsDraw(rows){

	for(let i = 0; i < rows.length; i++){
    	    context.push({name:rows[i].name,id:rows[i].id});
	}
	res.send(context);
0    }
});
//used on draw page to populate dropdown - returns names and id s of all backgrounds.
//no required parameters in route
app.get('/getAllBackgroundNames', function(req,res){
    var context = [];
    getUserBackgroundsDraw(res,mysql,context,req.session.userId,sendBackBackgroundsDraw);
    
    function sendBackBackgroundsDraw(rows){

	for(let i = 0; i < rows.length; i++){
    	    context.push({name:rows[i].name,id:rows[i].id});
	}
	res.send(context);
    }
});
//used on draw page - user chooses part from background and selects delete
//requires part id in req.query.partId
app.get('/deletePart', function(req,res){

    var context = {};
    
    deletePart(res,mysql,context,req.query.partId,complete);

    function complete(){
	res.end();
    }
});
//used on draw page - user chooses part from background and selects delete
//requires the background id in req.query.backgroundId
app.get('/deleteBackground', function(req,res){

    var context = {};
    
    deleteBackground(res,mysql,context,req.query.backgroundId,complete);

    function complete(){
	res.end();
    }
});
//retrieve part from db and send to client
//requires part id in req.query.partId
app.get('/retrievePart', function(req,res){

    var context = {};
    getPartById(res,mysql,context,req.query.partId,sendPartToClient);

    function sendPartToClient(results){
	res.send(results[0]);
    }
});
//retrieve background from db and send to client
//requires background id in req.query.backgroundId
//used by draw page and by my creations page
app.get('/retrieveBackground', function(req,res){

    var context = {};

    getBackgroundById(res,mysql,context,req.query.backgroundId,sendPartToClient);

    function sendPartToClient(results){
	res.send(results[0]);
    }
});
//retrieve monster from db and send to client
//requires monster id in req.query.monsterId
//used by my creations page
app.get('/retrieveMonster', function(req,res){

    var context = {};

    getMonsterById(res,mysql,context,req.query.monsterId,sendPartToClient);

    function sendPartToClient(results){
	res.send(results[0]);
    }
});
//updatePart in db - part must already exist in db 
//requires type, name, partId, blob
app.post('/updatePart',auth,upload.any(),function(req,res,next){

    var context = {};
    
    //extract string from req and cut out the quotes from each item
    var type_name = req.body.type;
    var name = req.body.name;
    var partId = req.body.id;
    
    updatePart(res,mysql,context,name,type_name,req.files[0].buffer,req.session.userId,partId,complete);
    
    function complete(){
	   res.end();
    }
    
});
//updateBackground in db - background must already exist in db 
//requires name, partId, blob
app.post('/updateBackground',auth,upload.any(),function(req,res,next){

    var context = {};
    
    //extract string from req and cut out the quotes from each item
    var name = req.body.name;
    var backgroundId = req.body.id;
    

    updateBackground(res,mysql,context,name,req.files[0].buffer,req.session.userId,backgroundId,complete);

    function complete(){
	   res.end();
    }
    
});


/********************************End of routes used on draw page*******************************/

/******************************** Begin Assembly Page Routes **********************************/
app.get('/getAssemblyDisplayParts', function(req,res){
    let context = [];
    if(req.query.mine == 'true'){
        getUserPartListByType(res, mysql, context, req.query.pType, req.session.userId, sendBackDisplayParts);
    }
    else{
        getPartListByType(res, mysql, context, req.query.pType, sendBackDisplayParts);
    }
    function sendBackDisplayParts(rows){
        for(let i = 0; i < rows.length; i++){
                context.push({id:rows[i].id, name:rows[i].name, type:rows[i].type, file: rows[i].file});
        }
        res.send(context);
    }
});

app.post('/saveMonster', auth, upload.any(), function(req,res,next){
    let context = {};
    //extract string from req and cut out the quotes from each item
    let name = req.body.name;
    let pArr = JSON.parse(req.body.pArray);
    let pArray = [];
    for(let index = 0; index < pArr.length; index++){
        let id = Number(pArr[index].id);
        let size = Number(pArr[index].size);
        let orientation = Number(pArr[index].orientation);
        let z = Number(pArr[index].zIndex);
        pArray.push([id, size, orientation, z, pArr[index].xCoord, pArr[index].yCoord]);
    }
    insMonster(res,mysql,context,req.body.name,req.files[0].buffer,pArray,req.session.userId,complete);
    function complete(response){
        res.send(context);
        res.end();
    }
});

app.post('/updateMonster', auth, upload.any(), function(req,res,next){
    let callbackCount = 0;
    let context = {};
    //extract string from req and cut out the quotes from each item
    let mid = Number(req.body.mid);
    let name = req.body.name;
    let pArr = JSON.parse(req.body.pArray);
    let pArray = [];
    for(let index = 0; index < pArr.length; index++){
        let id = Number(pArr[index].id);
        let size = Number(pArr[index].size);
        let orientation = Number(pArr[index].orientation);
        let z = Number(pArr[index].zIndex);
        pArray.push([id, size, orientation, z, pArr[index].xCoord, pArr[index].yCoord]);
    }
    updateMonsterName(res, mysql, context, mid, name, complete);
    updateMonsterBlob(res, mysql, context, mid, req.files[0].buffer, complete);
    updateMonsterParts(res, mysql, context, mid, pArray, complete)
    function complete(){
        callbackCount++;
        if(callbackCount >= 3){
            res.send(context);
            res.end();
        }
    }
});

app.get('/updateMonsterName', auth, function(req,res){
    let context = {};
    updateMonsterName(res, mysql, context, req.query.mid, req.query.name, complete);
    function complete(){
        res.send(context);
        res.end();
    }
});

// part search drop down list
app.get('/getPartsByName', auth, function(req,res){
    let context = [];
    let uid = 0;
//    console.log(req.query.mine);
    if(req.query.mine == 'true'){
        uid = req.session.userId;
    }
    else{
        uid = 'alpha';
    }
    searchPartByName(res, mysql, context, req.query.name, uid, complete);
    function complete(rows){
        for(let i = 0; i < rows.length; i++){
                context.push({id:rows[i].id, name:rows[i].name});
        }
        res.send(context);
        res.end();
    }
});
// list selected
app.get('/getPartsById', auth, function(req,res){
    let context = [];
    getPartById(res, mysql, context, req.query.pid, complete);
    function complete(results){
        context.push({id : results[0].id, name: results[0].name, type: results[0].type, file: results[0].file});
        res.send(context);
        res.end();
    }
});

// monster search drop down list
app.get('/getMonsterByName', auth, function(req,res){
    let context = [];
    searchMonsterByName(res, mysql, context, req.session.userId, req.query.name, complete);
    function complete(rows){
        for(let i = 0; i < rows.length; i++){
                context.push({id:rows[i].id, name:rows[i].name});
        }
        res.send(context);
        res.end();
    }
});
//
app.get('/getMonsterById', auth, function(req,res){
    let context = [];
    getMonsterAssemblyById(res, mysql, context, req.query.mid, complete);
    function complete(rows){
//        console.log('returning getMonsterById');
//        console.log([rows]);
        context.push({});
        res.send(rows);
        res.end();
    }
});



/******************************** End Assembly Page Routes ************************************/



/******************************** Begin Habitat Page Routes ************************************/
app.post('/getSingleBackground',auth,function(req,res){
    var context = {};


    getSingleBackground(res,mysql,context,req.body.backgroundId,complete);

    function complete(){
	res.send(context);
	res.end();
    }
    
});
app.post('/retrieveMonstersAndBackgrounds',auth,function(req,res){

   
    var context = {};
    if(req.body.onlyMyBackgrounds == true){

	getMyBackgrounds(res,mysql,context,req.session.userId,retrieveMyMonsters);
    }
    else{

	getAllBackgrounds(res,mysql,context,retrieveMyMonsters);

    }
    
    
    function retrieveMyMonsters(){
	getMyMonsters(res,mysql,context,req.session.userId,complete);
    }
    function retrieveAllMonsters(){
	getAllMonsters(res,mysql,context,complete);
    }
    
    //send context back to client but dont render
    function complete(){
	res.send(context);
	res.end();
    }

    
});
app.post('/updateMonsterBackgroundCombo', auth, upload.any(), function(req,res,next){
//    console.log(req.body);
    var context ={};
                          //req,res,mysql,context,userId,monsterId,backgroundId,size,xCoord,yCoord,complete)
    updateMonsterBackground(req,res,mysql,context,req.session.userId,req.body.monsterId,req.body.backgroundId,req.body.sizeMo,req.body.xCoordMo,req.body.yCoordMo,complete);


    function complete(changedRows){
	let context = {};
	context.changedRows = changedRows;
	res.send(context);
    }
});

/******************************** End Habitat Page Routes ************************************/

/******************************** Begin Gallery Page Routes ***************************************/
app.get('/getMonsterCount', function(req,res){
    let context = {};
    let uid = req.session.userId;
    if(req.query.mine == 'true'){
        getUserMonsterCount(res, mysql, uid, context, complete);
    }
    else{
        getMonsterCount(res, mysql, context, complete);
    }
    function complete(response){
        context.limitPerPage = limitPerPage;
        context.mTotal = response[0].mTotal;
        res.send(context);
        res.end();
    }
});

app.get('/getGallery',function(req,res){
    let context = [];
    let uid = req.session.userId;
    let page = Number(req.query.page);
    if(req.query.mine == 'true'){
        getUserMonsterGallery(res, mysql, uid, page, context, complete);
    }
    else{
        getMonsterGallery(res, mysql, page, context, complete);
    }
    function complete(results){
        res.send(results);
        res.end();
    }
});

app.get('/getSingleGalleryById', function(req,res){
    let context = [];
    getSingleGalleryById(res, mysql, req.query.mid, context, complete);
    function complete(results){
        res.send(results);
        res.end();
    }
});


/******************************** End Gallery Page Routes *****************************************/
/******************************** Begin Create Account Page Routes ************************************/
//create account form submits here. Will need insert into query here to add username/password to user table
app.post('/createAccount',function(req,res){
    var context = {};
    //check for blank fields in create account form
    for(var v in req.body){
	   if(req.body[v] == "") context.unableToCreateAccount = true;
    }

    if(context.unableToCreateAccount == true){
	context.layout = 'loginLayout';
	res.render('createAccount',context);
    }
    else if(req.body.password != req.body.reEnterPassword){
	context.passwordMismatch = true;
	context.layout = 'loginLayout';
	res.render('createAccount',context);
    }
    else{
	insUser(res, context, req.body.firstName, req.body.lastName, req.body.username, req.body.password, insertSuccess);
    }    
    
    function insertSuccess(){
	req.session.loggedIn = true;
	req.session.username =  req.body.username;
	
	getUserId(res,mysql,context,req.session.username,complete);

	
	function complete(){
	    req.session.userId = context.userId;
	    res.redirect(`${ROOT}/home`);
	}	
    }

});

/******************************** End Create Account Page Routes ************************************/
	
//404 error
app.use(function(req,res){
  res.type('plain/text');
  res.status(404);
  res.render('404');
});

//500 error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log(`Express started on: ${app.get('port')}; press Ctrl-C to terminate.`);
})
