class Context {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.method = req.method;
        this.url = req.url;
        this.body = req.body;
    }

    json(data){
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(data));
    }

    send(data){
        this.res.end(data);
    }
}

module.exports = Context;