const axios = require('axios')
const querystring = require('querystring')
const fs = require('fs')
const functions = require('firebase-functions')

module.exports = async function print(filename) {
    const params = {
        grant_type: 'password',
        username: functions.config().epson.email,
        password: ''
    };
    const res1 = await axios.post('https://api.epsonconnect.com/api/1/printing/oauth2/auth/token?subject=printer', querystring.stringify(params),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            auth: {
                username: functions.config().epson.username,
                password: functions.config().epson.password
            }
        }
    )
        .then(res => res.data)
        .catch(err => err)
    const res2 = await axios.post(`https://api.epsonconnect.com/api/1/printing/printers/${res1.subject_id}/jobs`,
        {
            job_name: "test",
            print_mode: "document"
        },
        {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${res1.access_token}`
            }
        }
    )
        .then(res => res.data)
        .catch(err => err)
    const file = fs.readFileSync(filename)
    await axios.post(`${res2.upload_uri}&File=1.pdf`,
        file,
        {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        }
    ).then(res => res.status)
        .catch(err => err)
    await axios.post(`https://api.epsonconnect.com/api/1/printing/printers/${res1.subject_id}/jobs/${res2.id}/print`,
        {},
        {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${res1.access_token}`
            }
        }
    ).then(res => res.status)
        .catch(err => err)
}
