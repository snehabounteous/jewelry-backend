import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 4000;

console.log("Database URL:", process.env.DATABASE_URL);


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({message: "hello"});
});

export default app;
