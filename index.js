const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
// const cors = require('cors');
const path = require('path');
let axios = require('axios');
const { response } = require('express');

const app = express();
const apiKey = "7a944b3b6970365b3e7eaf42316fe81b";
const PORT = 3000;

app.use(express.static('public'));
// app.use(cors());
app.set('views', path.join(__dirname, 'views'));
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", 'ejs');

app.get("/", (req, res) => {
    res.render("index", { weather: null, error: null })
});

app.get("/users", async (req, res) => {
    try {
        let users = [];
        // const user = {
        //     firstName: 'Tim',
        //     lastName: 'Cook',
        // }
        await axios
            .get("https://jsonplaceholder.typicode.com/users")
            .then(response => {
                users = response.data;
                res.render("users", {error: null, users: users}); 
            })
            .catch(error => console.log(error));
            res.render("users", {error: "Error, please try again", users: null});          
    } catch (error) {
        console.log(error);
        // res.send('Error');     
        res.render("users", {error: "Error, please try again", users: null});   
    }
});

app.post("/", async (req, res) => {
    const city = req.body.city;
    try {
        await axios
            .get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => {
                let weather = response.data;
                // convert meter to km
                weather.visibility = weather.visibility/1000;
                // convert wind speed meter/sec to kph
                weather.wind.speed = parseInt(((weather.wind.speed) * 3.6).toString().split('.')[0]);
                weather.main.feels_like = weather.main.feels_like.toString().split('.')[0];
                console.log(weather);
                // Create a new JavaScript Date object based on the timestamp
                // multiplied by 1000 so that the timestamp argument is in milliseconds, not seconds.
                let sunrise_unix_timestamp = weather.sys.sunrise;
                let sunset_unix_timestamp = weather.sys.sunset;
                var options = {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                    // second: 'numeric',
                };
            
                let sunrise = new Date(sunrise_unix_timestamp * 1000).toLocaleString('en-US', options);
                let sunset = new Date(sunset_unix_timestamp * 1000).toLocaleString('en-US', options);
                
                if (weather.main == undefined) {
                    res.render("index", {weather: null, error: "Error, please try again", sunrise: "", sunset: ""});
                } else {
                    res.render("index", {weather: weather, error: null, sunrise: sunrise, sunset: sunset});
                }
            })
            .catch(error => {
                res.render("index", {weather: null, error: `${error.response.data.message}, please try again`, sunrise: "", sunset: ""});
            });        
    } catch (error) {
        res.render("index", {weather: null, error: "Error, please try again", sunrise: "", sunset: ""})
    }
});

// app.post("/", (req, res) => {
//     const city = req.body.city;
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
//     request(url, function (err, response, body) {
//         if (err) {
//             res.render("index", {weather: null, error: "Error, please try again", icon: ""});
//         } else {
//             let weather = JSON.parse(body);
//             if (weather.main == undefined) {
//                 res.render("index", {weather: null, error: "Error, please try again", icon: ""})
//             } else {
//                 let text = `It's ${weather.main.temp} degree celsius with ${weather.weather[0].description} in ${weather.name}`
//                 res.render("index", {weather: text, error: null, icon: weather.weather[0].icon});
//                 // console.log(text, body);
//             }
//         }
//     })
// })

app.listen(3000, () => console.log(`server started ad listening on port ${PORT}`));



/* Notes: 
    1. We know that 
        1 meter = 1/1000 kilometers and 
        1 second = 1/3600 hour

        1 m/s = 1/1000 ÷ 1/3600 = 3600/1000 = 18/5 = 3.6

        Hence, to convert meter per second to kilometer per hour we multiply the given number by 3.6.
    
    2.  note: the temp return by openweatherapi is in kelvin format to convert it into celsius simply substract the 
        temp with value 273.15 or we can add &units=metric in the url like below, it will directly give you temp in celsius
        https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
         
        For temperature in Celsius use units=metric, For temperature in Fahrenheit use units=imperial
        
    3. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
    
    4. to convert meter to km => value_meter/1000 coz 1 meter = 1000km
    
    5. Another way to convert unix timestap of sunrise/sunset with 12 hr format
        var date = new Date(unix_timestamp * 1000).toLocaleTimeString();
        time = date.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [date];
        if (time.length > 1) { // If time format correct
            time = time.slice (1);  // Remove full string match value
            time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        time = time.join ('');
*/