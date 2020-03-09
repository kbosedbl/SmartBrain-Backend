const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const app = express();

const db = knex({
  client: 'pg', 
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'kbosedbl',
    database : 'Smart-Brain'
  }
});

db.select('*').from('users');

/*const database = {
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
}*/

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res)=>{
	res.send(database.users);
})

app.post('/signin' , (req, res) =>{
	db.select('email','hash').from('login')
		.where('email' , '=' , req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password , data[0].hash);
			console.log(isValid);
			if(isValid){
				return db.select('*').from('users')
					.where('email','=',req.body.email)
					.then(user => {
						res.json(user[0]);
					})
					.catch(err => res.status(200).json('Incorrect'));
			}
			else{
				res.status(400).json('Wrong Information');
			}
		})
		.catch(err => res.status(200).json('Incorrect'));
})

app.post('/register' , (req,res) =>{
	const {email,password,name} = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
				.then(trx.commit)
				.catch(trx.rollback);
		})
		.catch(err => res.status(400).json('Unable to register'));
	})

	/*db('users')
	.returning('*')
	.insert({
		email: email,
		name: name,
		joined: new Date()
	}).then(user => {
		res.json(user[0]);
	}).catch(err => res.status(400).json('Unable to register'))*/	
})

app.get('/profile/:id', (req , res) => {
	const { id } = req.params;
	let found = false;
	db.select('*').from('users')
	.where({
		id: id
	})
	.then(user => {
		res.json(user[0]);
		found = true;
	})
	.catch(err => {
		console.log(err);
	})
})

app.put('/image', (req , res )=>{
	const { id } = req.body;
	let found = false;
	db('users').where('id', '=' , id)
	.increment('entries',1)
	.returning('entries')
	.then(entries => {
		console.log(entries);
		res.json(entries[0]);
	})
	.catch(err => {
		console.log(err);
	})
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