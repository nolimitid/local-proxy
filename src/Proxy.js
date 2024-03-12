const httpProxy = require("http-proxy");
const http = require("http");
const url = require("url");
const net = require('net');
const { HttpsProxyAgent } = require('https-proxy-agent');
const CreatePendingPromise = require('./PromisePatch');


const regex_hostport = /^([^:]+)(:([0-9]+))?$/;

const getHostPortFromString = function (hostString, defaultPort) {
    let host = hostString;
    let port = defaultPort;

    const result = regex_hostport.exec(hostString);
    if (result != null) {
        host = result[1];
        if (result[2] != null) {
            port = result[3];
        }
    }

    return ([host, port]);
};

const Proxy = {
    /**
     * 
     * @param {number} port 
     * @param {string} proxy 
     * @returns {Promise<void>}
     */
    start: (port, proxy) => {
        const agent = new HttpsProxyAgent(proxy)
        const promise = CreatePendingPromise()
        const server = http.createServer(function (req, res) {
            const urlObj = url.parse(req.url);
            const target = urlObj.protocol + "//" + urlObj.host;

            console.log("Proxy HTTP request for:", target);

            const proxy = httpProxy.createProxyServer({});
            proxy.on("error", function (err, req, res) {
                console.log("proxy error", err);
                res.end();
            });

            proxy.web(req, res, { target: target, agent: agent });
        }).listen(port, () => promise.resolver());  //this is the port your clients will connect to



        server.addListener('connect', function (clientReq, clientSocket, bodyhead) {
            const hostPort = getHostPortFromString(clientReq.url, 443);
            const hostDomain = hostPort[0];
            const port = parseInt(hostPort[1]);
            console.log("Proxying HTTPS request for:", hostDomain, port);
            const proxyUri = agent.proxy
            const options = {
                port: parseInt(proxyUri.port),
                hostname: proxyUri.hostname,
                method: 'CONNECT',
                path: `${hostDomain}:${port}`,
                headers: {
                    'proxy-authorization': 'Basic ' + Buffer.from(`${proxyUri.username}:${proxyUri.password}`).toString('base64')
                }
            }
            const proxySocket = http.request(options)
            // proxySocket.end()
            proxySocket.end()
            proxySocket.on("connect", (res, socket, head) => {
                // make a request over an HTTP tunnel
                // console.log(res)
                clientSocket.write(
                    "HTTP/" + clientReq.httpVersion + " 200 \r\n\r\n",
                    "utf-8",
                    () => {
                        socket.pipe(clientSocket);
                        clientSocket.pipe(socket);
                        socket.on("error", (err) => {
                            console.log("Error on connecting", err);
                        });
                        socket.on("close", () => {
                            console.log("Closing", clientReq.url);
                        });
                    }
                );
            });
            proxySocket.on("error", (e) => {
                console.log("Error on connecting", e);
                clientSocket.end();
            });
            clientSocket.on('error', (e) => { })
        });
        server.on('error', (e) => console.log('Proxy error', e))
        return promise
    }
}

module.exports = Proxy


