const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config } = require('dotenv');
const dbConnection = require('./database/dbConnection.js');
const { authRoutes } = require('./routes');
const { randomBytes } = require('crypto');

config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

dbConnection();

app.use('/api/V1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Azax server is running on http://localhost:${PORT}`);
});
