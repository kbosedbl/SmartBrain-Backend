const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookies',			
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Sally',
			email: 'sally@gmail.com',
			password: 'bananas',			
			entries: 0,
			joined: new Date()
		}
	],

	login: [
		{
			id: '987',
			hash: '$2a$10$s3mo5M2QOVfxpgL7xWSTeexJykSqjmj28Qvp02fze1Qbryml7elwO',
			email: 'john@gmail.com'
		}
	]
}

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res)=>{
	res.send(database.users);
})

app.post('/signin' , (req, res) =>{
	 bcrypt.compare("apples", "$2a$10$s3mo5M2QOVfxpgL7xWSTeexJykSqjmj28Qvp02fze1Qbryml7elwO", function(err, res) {
    	console.log("First choice",res);
	});
	bcrypt.compare("veggies", "$2a$10$s3mo5M2QOVfxpgL7xWSTeexJykSqjmj28Qvp02fze1Qbryml7elwO", function(err, res) {
    	console.log("Second choice",res);
	});
	if(req.body.email === database.users[0].email && 
		req.body.password === database.users[0].password){
			res.json(database.users[0]);
	}
	else
	{
		res.status(404).json('error logging in');
	}
})

app.post('/register' , (req,res) =>{
	const {email,password,name} = req.body;
	bcrypt.hash(password, null, null, function(err, hash) {
    // Store hash in your password DB.
    	console.log(hash);
	});
	database.users.push({
			id: '125',
			name: name,
			email: email,			
			entries: 0,
			joined: new Date()
		})
	res.json(database.users[database.users.length - 1])
})

app.get('/profile/:id', (req , res) => {
	const { id } = req.params;
	let found = false;
	database.users.forEach(user => {
		if(user.id === id)
		{
			found = true;
			return res.json(user);
		}
	})
	if(!found){
		res.status(404).json("no such user");
	}
})

app.put('/image', (req , res )=>{
	const { id } = req.body;
	let found = false;
	database.users.forEach(user => {
		if(user.id === id)
		{
			found = true;
			user.entries++;
			return res.json(user.entries);
		}
	})
	if(!found){
		res.status(404).json("no such user");
	}	
})

/*bcrypt.hash("bacon", null, null, function(err, hash) {
    // Store hash in your password DB.
});*/

// Load hash from your password DB.
/*  bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
});
bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
});   */

app.listen(3000, ()=>{
	console.log('app is running on port 3000');
})

/*

/ --> res = this is working

/signin --> POST = success/fail

/register --> POST = user

/profile/:userId --> GET = user

/image ---> PUT --> user

*/