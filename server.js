const express = require('express');
const http = require('http');//httpsサーバー機能のモジュール
const { Server } = require('socket.io');
const cors = require('cors');//CORSを許可するためのミドルウェア

//expressでサーバーアプリを作成
const app = express();
const server = http.createServer(app);

//Socket.ioのサーバーインスタンスを作成
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // ReactアプリのURL
    methods: ['GET', 'POST']
  }
});

app.use(cors());

//新しいクライアントが接続されたときの処理
io.on('connection', (socket) => {
  console.log('クライアント接続:', socket.id);//接続したクライアントの表示
  
  //クライアントからデータが送られた時
  socket.on('send_message', (data) => {
    console.log('メッセージ受信:', data);
    io.emit('receive_message',data);//接続中の全クライアントに送信
  });

  //クライアントがブラウザを閉じたり、接続を切ったとき
  socket.on('disconnect', () => {
    console.log('クライアント切断:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('サーバー起動: http://localhost:4000');
});
