const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware'); 
const rateLimit = require('express-rate-limit');
const app = express();

const PORT = 3006;

const limmiter = rateLimit({
    windowMs: 2*60*1000,
    max: 5
});

app.use(morgan('combined'));
app.use(limmiter);
app.use('/home',async (req,res,next) => {
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
            headers : {
                'x-access-token' : req.headers['x-access-token']
            }
        });
        if(response.data.success) {
            next();
        }else{
            return res.status(401).json({
                message: 'Authentication Failed'
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Authentication Failed'
        });
    }
});
app.use('/bookingservice/api', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true}));

app.get('/home', (req,res) => {
    return res.json({
        message: 'Hitting home endpoint.'
    });
});
app.listen(PORT, () => {
    console.log(`Server started on Port ${PORT}`);
});