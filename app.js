const express = require("express");
const path = require("path");
const con = require("./config/db");
const bcrypt = require('bcrypt');
const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint for getting room data
app.get('/getroom', function(req, res) {
    const sql = "SELECT rooms.room_name, rooms.image_path, time_slots.start_time, time_slots.end_time, time_slots.status FROM rooms INNER JOIN time_slots ON rooms.room_id = time_slots.room_id;";
    con.query(sql, function(err, results) {
        if (err) {
            console.error('Error fetching room data:', err);
            res.status(500).json({ error: 'An error occurred while fetching room data.' });
        } else {
            res.status(200).json(results);
        }
    });
});


app.get('/regist.html', (_req, res) => {
    res.sendFile(path.join(__dirname, 'views/regist.html'));
});

// Register Create routes
app.post("/regist/create", async (req, res) => {
    const { name, email, username, password } = req.body;
    let hashpass = await bcrypt.hash(password, 10);
    try {
        con.query(
            "INSERT INTO users(username, email, password, role) VALUES(?,?,?,1)",
            [username, email, hashpass],
            (err, results, fields) => {
                if(err){
                    console.log("Error while inserting a user into the database", err);
                    return res.status(400).send();
                }
                return res.status(201).redirect('/login');
            } 
        );
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
});

// Routes
app.get('/password/:raw', function(req, res){
    const raw = req.params.raw;
    bcrypt.hash(raw, 10, function(err, hash){
        if(err){
            res.status(500).send('Server error');
        }
        else{
            res.send(hash);
        }
    });
});

app.post('/login', function(req, res){
    const username = req.body.username;
    const raw_password = req.body.password;
    const sql = "SELECT user_id,role,password FROM users WHERE username=?";
    
    con.query(sql, [username], function(err, results){
        if(err) {
            console.error(err);
            res.status(500).send('Server error');
        }
        else{
            if(results.length === 1){
                const hash = results[0].password;
                bcrypt.compare(raw_password, hash, function(err, same){
                    if(err){
                        res.status(500).send('Server error');
                    }else{
                        if(same){
                            res.json({ role: results[0].role })
                        }
                        else {
                            res.status(401).send('Login fail: wrong password');
                        }
                    }
                });
            }
            else{
                res.status(401).send('Login fail: wrong username');
            }
        }
    });
    // ------------- GET all unablebook --------------
app.get("/unablebook", function (req, res) {
    const sql = "SELECT BookingID FROM booking_details WHERE ReturnStatus IN (pending,reserved,disabled ) AND BorrowerID = ?;";
    con.query(sql, [req.session.userID], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});
});


app.post('/bookingroom', function (req, res) {
    const newBooking = req.body;
    // Insert a new record into the booking_details table
    const sql = "INSERT INTO booking_details SET ?";
    con.query(sql, newBooking, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        const sql1 = "UPDATE Status =pending  WHERE sta =?;";
        con.query(sql1, [newBooking.MotorcycleID], function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("Database server error");
            }
            res.send('/REQUEST_STATUS');

        });

    });
});

app.post('/api/mark_room_as_free', (req, res) => {
    const { room, time } = req.body;
    
});


// Routes for serving HTML files
app.get('/login', function(req, res){
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

// Routes for redirection after login
app.get('/G10HomeUser', function(req, res){
    res.sendFile(path.join(__dirname, '/views/G10HomeUser.html'));
});

app.get('/G10Homelecturer', function(req, res){
    res.sendFile(path.join(__dirname, '/views/G10Homelecturer.html'));
});

app.get('/G10Homestaff', function(req, res){
    res.sendFile(path.join(__dirname, '/views/G10Homestaff.html'));
});

app.get('/G10Dash', function(req, res){
    res.sendFile(path.join(__dirname, '/views/G10Dash.html'));
});

app.get('/history_lecturer', function(req, res){
    res.sendFile(path.join(__dirname, '/views/history_lecturer.html'));
});

app.get('/history_student', function(req, res){
    res.sendFile(path.join(__dirname, '/views/history_student.html'));
});

app.get('/historystaff', function(req, res){
    res.sendFile(path.join(__dirname, '/views/historystaff.html'));
});

app.get('/room_list1', function(req, res){
    res.sendFile(path.join(__dirname, '/views/room_list1.html'));
});

app.get('/roomlist_lecturer', function(req, res){
    res.sendFile(path.join(__dirname, '/views/roomlist_lecturer.html'));
});

app.get('/roomlist_staff', function(req, res){
    res.sendFile(path.join(__dirname, '/views/roomlist_staff.html'));
});

const port = 3000;
app.listen(port, function () {
    console.log("Server is ready at " + port);
});
