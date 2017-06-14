        const func = require("./functions.js");//処理のメインのスクリプトです。（後述）
        const co = require("co");//非同期処理の要
        const express = require("express");//サーバーの元
        const http = require("http");
        const bodyParser = require('body-parser');//JSONを扱うのを簡単にしてくれるらしい

        const app = express();
        const htdocs = 'htdocs'; //GETしてきたとき用のルートディレクトリ
        const listening_port = 80; //Listeningポート

        const server1 = http.createServer(app); //expressサーバーを設定


        app.use(bodyParser.urlencoded({extended: true})); // JSONの送信を許可
        app.use(bodyParser.json()); // JSONのパースを楽に（受信時）

        app.get('/', function (req, res) {

                res.set('Content-Type', 'text/html');
                res.sendfile(htdocs + '/index.html');
        });

        app.use('/css', express.static(htdocs + '/css'));

        app.use('/js', express.static(htdocs + '/js'));

        app.get('/callback', function (req, res) {

                res.set('Content-Type', 'text/html');
                res.sendfile(htdocs + '/index.html');

        });

        app.post('/callback', function (req, res) {

                co(function * () {

                        var FromLine = yield func.make_FromLine(req);

//処理1:LINEからのJSONを基にこっちで必要な情報だけを抜き取る -> FromLineへ格納

                        var contents = yield func.reply_manager(FromLine);

//処理2:FromLineを基に返信データを作成 -> contentsへ

                        var ToLine = yield func.make_message_data(FromLine.atesaki, contents);

//処理3:contentsを基に返信データを梱包 -> ToLine へ格納

                        yield func.Send_to_Line(ToLine);

//処理4:それを送る

                }).catch(onerror);

        });

        process.on('unhandledRejection', console.dir);

        server1.listen(process.env.PORT || listening_port); //expressサーバーを開始

        console.log('\-----Server running-----\n');

        function onerror(err) {
                console.error(err);
        }
