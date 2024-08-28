const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;
const WINDOW_SIZE = 10;

let windowState = [];

// this is my auth token generated using the 'test/auth' api
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0ODI0ODc4LCJpYXQiOjE3MjQ4MjQ1NzgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjljMTExMWI1LWMyMWEtNDU2Yy1hZjA4LTlhNjI3NTI1Y2EwMSIsInN1YiI6ImNzYWkyMTE5NkBnbGJpdG0uYWMuaW4ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjljMTExMWI1LWMyMWEtNDU2Yy1hZjA4LTlhNjI3NTI1Y2EwMSIsImNsaWVudFNlY3JldCI6InVySGl4Vkh6c2FOa211T1MiLCJvd25lck5hbWUiOiJUYW5pc2hrIFNoYXJtYSIsIm93bmVyRW1haWwiOiJjc2FpMjExOTZAZ2xiaXRtLmFjLmluIiwicm9sbE5vIjoiMjEwMTkyMTUyMDE4MCJ9.b-WR-3eNNXRG6-jDD_ZAbGlzEI9eCi_iUlUCM86Pu4A';

// async function to fetch numbers based on the type
async function fetchNumbers(type) {
    let url = '';
    switch (type) {     //using switch case to handle api routes for various forms of calls
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/rand';
            break;
        default:
            throw new Error('Invalid number type');
    }

    try {
        const response = await axios.get(url, {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}` //passing auth token to get the response
            }
        });
        console.log('API Response:', response.data); 
        return response.data.numbers || [];
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

// Function to calculate the average
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return parseFloat((sum / numbers.length));  //returning the avg as an FLOAT type
}

// API route to get numbers and calculate the average
app.get('/numbers/:numberId', async (req, res) => {
    const { numberId } = req.params;
    const numbers = await fetchNumbers(numberId);
    
    
    console.log('Fetched numbers:', numbers);

    const uniqueNumbers = [...new Set(numbers)];
    console.log('Unique numbers:', uniqueNumbers);

    // updating the older ones with the new ones using the concept of sliding window
    const prevState = [...windowState];
    uniqueNumbers.forEach(num => {
        if (windowState.length < WINDOW_SIZE) {
            windowState.push(num);
        } else {
            windowState.shift();
            windowState.push(num);
        }
    });

    //checking
    console.log('Current window state:', windowState);

    const average = calculateAverage(windowState);
    

    // final responose
    const response = {
        windowPrevState: prevState,
        windowCurrState: windowState,
        numbers: uniqueNumbers,
        avg: average
    };

    res.json(response);
});

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
