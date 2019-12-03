-- Group 17: Christopher Elliott and Dane Emmerson
-- CS340
-- Project Step 7 - turn in project
-- Database Manipulation Queries
-- This file contains queries for monster drawing webapp
-- Due: 06/12/2019


-- ***************************** Begin General Queries *******************************
-- fetch all part types
SELECT id, type_name from part_types

-- fetch id and name for all parts made by user
SELECT id, name FROM parts WHERE userId=?

-- fetch id for all part types
SELECT id FROM part_types WHERE type_name = ?

-- fetch id and name for parts made by user
SELECT id, name from parts where userId = ? and type = ?

-- fetch one part with name specificed by user
select id, name, type, file from parts where name = ?

-- fetch all parts with the name attributes
select id, name from parts where name like ? limit 20
select id, name from parts where userId = ? and name like ? limit 20

-- fetch all parts of a type
SELECT id, name, type, file from parts where type = ?

-- fetch all parts of a type made by a specific user
SELECT id, name, type, file from parts where userID = ? and type = ?

-- fetch previsouly saved images of monster by userId
SELECT id, name, file from monster where userId = ?

-- fetch all parts assigned to monster by name of monster
SELECT m.id AS mid, m.name AS mname, p.id AS pid, p.name AS pname, p.type AS type, p.file AS file, mp.xCoord AS xCoord, mp.yCoord AS yCoord, mp.zIndex AS zIndex FROM monster m INNER JOIN monster_parts mp ON m.id = mp.id_monster INNER JOIN parts p ON mp.id_parts = p.id WHERE m.name = ? GROUP BY mp.zIndex ASC

-- fetch all monster with the name attributes
select id, name from monster where userId = ? and name like ? limit 10

-- fetch all parts assigned to monster by monster id
SELECT id_parts, size, orientation, zIndex, xCoord, yCoord FROM monster_parts mp WHERE id_monster = ? GROUP BY mp.zIndex ASC

-- fetch saved images and monster and background - requires user id
SELECT m.id as mid, m.name as mname, m.file as mfile, b.id as bid, b.name as bname, b.file as bfile from monster m inner join background b on m.backgroundId = b.id where userID = ?

-- counts total number of monsters in db
select COUNT(`id`) as mTotal FROM monster

-- count total number of monsters a specific user has made
select count(id) as mTotal from monster where userId=?

-- fetch all finalized monsters and their respective backgrounds
SELECT * FROM (SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser,ROW_NUMBER() OVER (ORDER BY m.name ASC) AS RowNum FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id) as Results WHERE RowNum>? AND RowNum<=?

-- fetch all monsters and respective backgrounds by a user
SELECT * FROM (SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser,ROW_NUMBER() OVER (ORDER BY m.name ASC) AS RowNum FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id WHERE m.userId=?) as Results WHERE RowNum>? AND RowNum<=?

-- fetch specific monster and respective background for gallery page
SELECT u.username as userName, m.name as monsterName, m.file as monsterBlob, m.size as size, m.xCoord as xCoord, m.yCoord as yCoord, b.name as bgName, b.file as backgroundBlob, ub.username as backgroundUser FROM monster m INNER JOIN background b on m.backgroundId = b.id INNER JOIN user ub on b.userId = ub.id INNER JOIN user u on m.userId = u.id WHERE m.id=?

-- fetch user id from username provided
SELECT id FROM user WHERE username = ?

-- fetch user encrypted password using user id
SELECT password FROM user WHERE id = ?

-- fetch id and name for all parts made by a specific user
SELECT id, name FROM background where userId = ?

-- fetch on background with id specified by user
SELECT id, name, file FROM background WHERE id=?

-- fetch one specific monster by id
SELECT id, name, file, userId, backgroundId FROM monster WHERE id=?

-- retrieve all background images, names, userId, id
SELECT id, name, file, userId FROM background

-- retrieve the names/ids for loggedin user's backgrounds
SELECT id, name, userId, file FROM background WHERE userId=?

-- retrieve names/ids for all monsters
SELECT id, name, userId, backgroundId, size, xCoord, yCoord, file FROM monster

-- retrieve the names/id for logged in user's monsters
SELECT id, name, userId, backgroundId, size, xCoord, yCoord, file FROM monster WHERE userId=?

-- retrieve just a single background by id
SELECT id, name, userId, file FROM background WHERE id=?

-- insert new part into db
INSERT INTO parts (name,type,file,userId) VALUES (?,?,?,?)

--insert a new background
INSERT INTO background (name, file, userID) VALUES (?,?,?)

-- insert a new monster
INSERT INTO monster (name, userId, file) VALUES (?,?,?)

-- insert new user
INSERT INTO user (firstName,lastName,username,password) VALUES (?,?,?,?)


-- update foreign key reference in monster table, along with size, xCoord, yCoord
UPDATE monster SET backgroundId=?,size=?,xCoord=?,yCoord=? WHERE id=?

-- update part in db
UPDATE parts SET name=?,type=?,file=?,userId=? WHERE id=?

-- update background in db
UPDATE background SET name=?,file=?,userId=? WHERE id=?

-- update a monster's name
UPDATE monster SET name=? WHERE id=?

-- update monster's blob
UPDATE monster SET file=? WHERE id=?

-- update parts associated with monster -- use delete query followed by insert
-- query for implementation purposes
DELETE FROM monster_parts WHERE id_monster=?
INSERT INTO monster_parts (id_monster, id_parts, size, orientation, zIndex, xCoord, yCoord) VALUES ?

-- delete a part from parts table
DELETE FROM parts WHERE id=?

-- delete a background from background table
DELETE FROM background WHERE id=?



/*
-- OLD QUERIES
-- ****************************READ QUERIES*****************************
-- for user login process:
SELECT `password` FROM users WHERE username=:user_supplied_login;

-- fetch all part types
SELECT id, type_name from part_types

-- fetch and name for all parts made by user
SELECT id, name from parts where userId = :?

-- fetch id for all part types
SELECT id FROM part_types WHERE type_name = :?

-- fetch id and name for parts made by user 
SELECT id, name from parts where userId = ? and type = ?

-- fetch on part with name specified by user of type
SELECT id, name, type, file from parts where userId = ? and name = ?

-- fetch all parts made by user of type
SELECT id, name, type, file from parts where type = ?

-- fetch previously saved image of monster
SELECT id, name, file from monster where userID = ?

-- fetch all parts assigned to monster by monster name
SELECT m.id AS mid, m.name AS mname, p.id AS pid, p.name AS pname, p.type AS type, p.file AS file, mp.xCoord AS xCoord, mp.yCoord AS yCoord, mp.zIndex AS zIndex 
FROM monster m 
INNER JOIN monster_parts mp ON m.id = mp.id_monster INNER JOIN parts p ON mp.id_parts = p.id 
WHERE m.name = ? GROUP BY mp.zIndex ASC

-- fetch all parts assigned to monster by monster id
SELECT m.id AS mid, m.name AS mname, p.id AS pid, p.name AS pname, p.type AS type, p.file AS file, mp.xCoord AS xCoord, mp.yCoord AS yCoord, mp.zIndex AS zIndex 
FROM monster m 
INNER JOIN monster_parts mp ON m.id = mp.id_monster 
INNER JOIN parts p 
INNER JOIN mp.id_parts = p.id 
WHERE m.id = ? 
GROUP BY mp.zIndex ASC

-- fetch saved images of monster and backgroun
SELECT m.id AS mid, m.name AS mname, m.file AS mfile, b.id AS bid, b.name AS bname, b.file AS bfile
FROM monster m INNER JOIN background b ON m.backgroundId = b.id 
WHERE userID = ?

-- fetch all finalized monsters
SELECT m.name AS mname, m.file AS mfile, b.file AS bfile 
FROM monster m 
INNER JOIN background b ON m.backgroundId = b.id

--fetch all user's finalized monsters
SELECT m.name AS mname, m.file AS mfile, b.file AS bfile 
FROM monster m 
INNER JOIN background b ON m.backgroundId = b.id 
WHERE userID = ?

--supply user with dropdown list containing all their monster creations
SELECT m.name
FROM monster m
INNER JOIN user u ON m.id=u.id;

--building a monster page from parts already in database
SELECT p.file, mp.orientation, mp.xCoord, mp.yCoord
FROM parts p
INNER JOIN monster-parts mp ON p.id=mp.id_parts
INNER JOIN monster m ON mp.id_monster=m.id
WHERE m.name=:user_supplied_from_dropdown;

--select background image / info for a particular monster
SELECT b.file
FROM background b
INNER JOIN monster m ON b.id=m.backgroundId
WHERE m.name=:user_supplied_from_dropdown;

--give user option to delete background image from table
DELETE FROM background b WHERE b.id IN (
SELECT id FROM background b WHERE b.name=:user_supplied_name_from_dropdown)

--give user option to interchange parts between monsters - dropdown selection
SELECT p.name, p.type
FROM parts p
INNER JOIN monster_parts mp ON p.id=mp.id_parts
INNER JOIN monster m ON mp.id_monster=m.id
INNER JOIN user u ON m.id=u.id;


-- ****************************INSERT QUERIES*****************************
--to create new account
INSERT INTO users (`firstname`,`lastname`,`username`,`password`) VALUES (:?,:?); 

-- insert a new part into parts
INSERT INTO parts (`name`,`type`,`file`,`userId`

-- insert a new background drawing
INSERT INTO background name, file, userID VALUES (?,?,?)

--inserts a new monster
INSERT INTO monster name, userID, file VALUES (?,?,?)

--drawing canvas page
--allow user to save a canvas drawing as a new part
INSERT INTO parts (name,type,file) VALUES (:user_chosen_name,:user_chosen_type,blob_file_grabbed_from_canvas);

--allow user to create new monster
INSERT INTO monster (name,user) VALUES (:user_supplied_name_for_monster,user_from_session);
--allow user to upload background file for a monster
INSERT INTO background (file) VALUES (:user_supplied_image_turned_into_blob);


-- ****************************UPDATE QUERIES*****************************
--updates part blob
UPDATE parts SET file VALUES ? WHERE id = ?

--change part type
UPDATE parts SET type values ? WHERE id = ?

--change part name
UPDATE parts SET name values ? WHERE id = ?

-- update background blob file
UPDATE background SET file VALUES ? WHERE id = ?

-- update background name
UPDATE background SET name VALUES ? WHERE id = ?

--update background associated with monster
UPDATE monster SET backgroundId VALUES ? WHERE id = ?

--change monster name
UPDATE monster SET name VALUES ? WHERE id = ?

-- update parts associated with monster -- technically not an update query, but works as one
DELETE FROM monster_parts WHERE mid = ?
INSERT INTO monster_parts id_monster, id_parts, xCoord, yCoord, zIndex VALUES (?,?,?,?,?)


-- ****************************DELETE QUERIES*****************************

--allow user to delete parts
DELETE FROM parts WHERE id=?

--delete monster query??

--delete account query??

*/
