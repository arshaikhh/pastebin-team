import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

// hello Abdul

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", async (req, res) => {
  const dbres = await client.query('select * from pastedata limit 10');
  res.json(dbres.rows);
  
});

app.post("/", async (req,res)=> {
  try {
    const input = req.body
    const dbres = await client.query('insert into pastedata(title,data,creation_date) values($1,$2,$3) returning *',[input.title,input.data,input.creationDate])
    console.log(input.data,input.title,input.creationDate)
    res.json(dbres.rows[0])
  }
  catch(err) {
    console.error(err.message)
  }
  
})

app.delete("/:id", async (req,res)=> {
  try {
    const input = req.params.id
    const dbres = await client.query('DELETE FROM pastedata WHERE id=($1) returning *',[input])
    res.json(dbres.rows[0])
  }
  catch(err) {
    console.error(err.message)
  }
})

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});