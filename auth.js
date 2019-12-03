module.exports = function(req,res,next){

    if(req.session.loggedIn === true){
	next();
    } 
    else{
	res.redirect('/');
    }
}
