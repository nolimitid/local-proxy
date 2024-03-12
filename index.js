const Proxy = require('./src/Proxy')

require('dotenv').config()

async function main() {
    const proxy = process.env.PROXY
    const port = process.env.PORT
    if (proxy && port) {
        await Proxy.start(port, proxy)
        console.log('Proxy is up on', port, 'using', proxy)
    } else {
        console.log('Please provide PORT and PROXY in .env!')
        process.exit(1)
    }
}

main()