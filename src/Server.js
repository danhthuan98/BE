const express = require("express");
const env = require("dotenv");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const { Server } = require('socket.io');

const authRouter = require("./router/admin/auth");
const categoryRouter = require("./router/category");
const initialDataRouter = require("./router/admin/initialData");
const productRouter = require("./router/product");

const userRouter = require("./router/auth");
const cartRouter = require('./router/cart');
const addressRouter = require("./router/address");
const orderRoutes = require("./router/order");
const adminOrderRoutes = require("./router/admin/orderRoutes");
const chatRoomRouter = require("./router/ChatRoom");
const postRouter = require('./router/post');


// config variable environment
env.config();
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.msoad.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
).then(() => {
    console.log("Database connected");
});

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'uploads')));
app.use('/api', authRouter);
app.use('/api', categoryRouter);
app.use('/api', initialDataRouter);
app.use('/api', productRouter);
app.use('/api', postRouter);

app.use('/api', userRouter);
app.use('/api', cartRouter);
app.use('/api', addressRouter);
app.use("/api", orderRoutes);
app.use("/api", adminOrderRoutes);


/** Socket IO */
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    // console.log(`User connected ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on('leave_room', (data) => {
        socket.leave(data);
        console.log(`User with ID: ${socket.id} leave room: ${data}`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });

});

app.use(function (req, res, next) {
    req.io = io;
    next();
});

app.use("/chat", chatRoomRouter);

server.listen(2001, () => {
    console.log('Server chat is running in port 2001');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running in port ${process.env.PORT}`);
});
