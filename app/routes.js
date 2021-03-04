var TodoEtcd = require('./etcd')
// var Todo = require('./models/todo');
var Etcd = require("node-etcd")
const TODO = "todo"
const { Etcd3 } = require('etcd3');

function getEtcd() {
    var host = process.env.SERVICE_CLUSTERIP || 'localhost';
    var port = process.env.ETCDCLUSTER_CLUSTERPORT || '2379';
    var etcdServer = host + ":" + port;
    return new Etcd3({ hosts: etcdServer });
    // return new Etcd("127.0.0.1:2379");
}

function GetAllTodos(callback) {
    getEtcd().get(TODO, {recursive: true}, console.log)
}

function GetTodo(id, data) {
    getEtcd().get(TODO + ":" + id, (data) => callback(data))
}
function getTodos(res) {
    Todo.find(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(todos); // return all todos in JSON format
    });
};

module.exports = function (app) {

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function (req, res) {
        // use mongoose to get all todos in the database
        // getTodos(res);
        getEtcd().getAll().prefix(TODO).strings().then(function (r) {
            res.send(r)
        })
    });

    // create todo and send back all todos after creation
    app.post('/api/todos', function (req, res) {
        var id = new Date().getTime();
        var obj = { text: req.body.text, id: id }
        getEtcd().put("todo:"+ id).value(JSON.stringify(obj)).then(function (r) {
            res.send(r)
        })
        // getEtcd().create(TODO,obj, function (err, data) {
        //     console.log('error', err)
        //     console.log('data',data)
        //     res.send({})
        // })

        // create a todo, information comes from AJAX request from Angular
        // Todo.create({
        //     text: req.body.text,
        //     done: false
        // }, function (err, todo) {
        //     if (err)
        //         res.send(err);
        //
        //     // get and return all the todos after you create another
        //     getTodos(res);
        // });

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {

        getEtcd().delete().key(req.params.todo_id).then(function (r) {
            res.send(r)
        })

        // getEtcd().del(TODO + )
        // Todo.remove({
        //     _id: req.params.todo_id
        // }, function (err, todo) {
        //     if (err)
        //         res.send(err);
        //
        //     getTodos(res);
        // });
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
