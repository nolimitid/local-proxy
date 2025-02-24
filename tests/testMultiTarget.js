const { default: axios } = require("axios");
const Proxy = require("../src/Proxy")
const { HttpsProxyAgent } = require('https-proxy-agent');
const qs = require('querystring')
async function main() {
    const proxy = await Proxy.multiTargetStart(9981, [
        'http://raspi1:kantor@proxycrawler.dashboard.nolimit.id:2560',
        'http://raspi2:kantor@proxycrawler.dashboard.nolimit.id:2560',
        'http://bandung:456@proxycrawler.dashboard.nolimit.id:2560'
    ])

    const httpsAgent = new HttpsProxyAgent('http://localhost:9981')
    const formData = new URLSearchParams(); 

    formData.append('variables', '{"shortcode": "DGX98euyOiz","__relay_internal__pv__PolarisFeedShareMenurelayprovider": true,"__relay_internal__pv__PolarisIsLoggedInrelayprovider": true}')
    formData.append('server_timestamps', 'true')
    formData.append('doc_id', '27628057533446192')
    // console.log(formData)
    const config = {
        method: 'POST',
        url: 'https://www.instagram.com/graphql/query',
        data: formData,
        headers: {
            accept: '*/*',
            "accept-language": 'en-US,en;q=0.9,id;q=0.8,ms;q=0.7',
            'content-type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: httpsAgent
    }
    console.log(config)
    const result = await axios.request(config)
    console.log('result', result.data)
}


main()