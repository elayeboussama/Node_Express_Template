require("dotenv").config();
const router = require("express").Router();
const { User } = require("../models/User");
const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decoded = jwt.decode(token)
        //console.log(req.body.headers)
        // console.log(token)
        //console.log(decoded)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })
}


router.post("/login", authenticateToken, async(req, res) => {
    const id = req.user["_id"]
    console.log(req.user)
    try {
        const user = await User.findOne({ _id: id });


        if (!user)
            return res.status(401).send({ message: "Not found" });

        if (user) {
            delete user.password
            res.status(200).send({ data: user, message: "User found" });
        }

    } catch (error) {

        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)

    }
});

router.post("/signup", async(req, res) => {
    try {
        const { error } = validate(req.body);

        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
       
        if (user)
            return res
                .status(409)
                .send({ message: "User with given email already Exist!" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        await new User({...req.body, password: hashPassword }).save();
        res.status(201).send({ message: "User created successfully"});
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error});
        console.log(error)
    }
});

// You need to create and config Admin to test this api
// This data allowed just for the Admin 
router.post("/showUser", authenticateToken, async(req, res) => {

    try {
        const id = req.user["_id"]
        
        const admin = await Admin.findOne({ _id: ObjectId(id) });
        if (admin) {
            const users = await User.find();
            res.status(201).send({ users: users });
        }
        res.status(401).send({ message: "You are not allowed to access this data" });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log( error)
    }
});

// You need to create and config Admin to test this api
// Deleting users not allowed for non Admin users 
router.post("/deleteUser", authenticateToken, async(req, res) => {


    try {
        const id = req.user["_id"]
        const admin = await Admin.findOne({ _id: ObjectId(id) });
        if (admin) { 
            await User.deleteOne({ _id: ObjectId(req.body.idUser) });
            res.status(201).send({ message: "User deleted successfully" });
        }
        res.status(401).send({ message: "You are not allowed to delete users" });

    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error });
        console.log(error)
    }
});



module.exports = router;