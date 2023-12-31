const express = require('express');
const { google } = require('googleapis');

//added jwt bcrypt mongoose  
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
const bodyParser=require('body-parser');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const config = require('./secret.json');
const db_string=process.env.DB_CONNECTION_STRING;


//started express server
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
const CLIENT_ID = config.web.client_id;
const CLIENT_SECRET = config.web.client_secret;
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const userTokens = []; // Array to store user tokens

//define routes
app.get('/', (req, res) => {
  res.send('Welcome to My Google Drive App!');
});

app.get('/login', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });

  res.redirect(authUrl);
});

app.get('/oauth/callback', async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Save tokens to the array for future use (for each user)
  userTokens.push(tokens);

  res.redirect('/');
});

app.get('/upload', (req, res) => {
  // Assuming you have obtained tokens for the user through the OAuth 2.0 process
  const userOAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
  // Set user credentials using the last saved tokens (you might want to implement proper user identification)
  userOAuth2Client.setCredentials(userTokens[userTokens.length - 1]);

  const drive = google.drive({ version: 'v3', auth: userOAuth2Client });
  //mydrive folder id
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  console.log(folderId);
  const fileMetadata = {
    name: 'example.txt',
    parents: [folderId],
  };

  const media = {
    mimeType: 'text/plain',
    body: 'Hello, World!',
  };

  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  }, (err, file) => {
    if (err) {
      console.error('Error uploading file:', err);
      res.status(500).send('Error uploading file');
    } else {
      console.log('File Id:', file.data.id);
      res.status(200).send('File uploaded successfully!');
    }
  });
});

// started server on port 3000
//made a connection to database
mongoose.connect(db_string)
.then(console.log("Database Successfully Connected"))
.catch(err=> console.log(err));
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
