const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const port = 3000;
const localhost = 'localhost';


var server = http.createServer((request, response) => {
    let parseUrl = url.parse(request.url, true);
    let path = parseUrl.pathname;
    path = path.replace(/^\/+|\/+$/g, '');
    let method = request.method;
    let query = parseUrl.query;
    let key = query.query;
    let headers = request.headers;
    let buffer = '';
    let data = [];
    // console.log(query.query);

    console.log(path);
    console.log(method);

    switch (path) {
        case 'venues':
            switch (method) {
                case 'OPTIONS':
                    respondToOptions(request, response);
                    break;
                case 'GET':
                    getVenues(request, response);
                    break;
                default:
                    console.log('Request not processed 1.');
                    send404(request, response);
                    break;
            }
            break;

        case 'categories':
            switch (method) {
                case 'OPTIONS':
                    respondToOptions(request, response);
                    break;
                case 'GET':
                    getCategories(request, response);
                    break;
                default:
                    console.log('Request not processed 3.');
                    send404(request, response);
                    break;
            }
            break;
        default:
            console.log('Request not processed 2.');
            send404(request, response);
            break;
    }
});

server.listen(port, localhost, () => {
    console.log('Server is listening port: ' + port + '.');
});

function loadData() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(process.cwd(), './data/data.json'), (err, data) => {
            if (err) {
                reject(null);
            } else {
                let dataTemp = JSON.parse(data);
                resolve(dataTemp);
            }
        });
    });
}

function saveVenues(venues) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.resolve(process.cwd(), './data/venues.json'), JSON.stringify(venues), (err) => {
            if (err) {
                reject();
            } else {
                console.log(JSON.stringify(venues));

                resolve();
            }
        });
    });
}

function saveCategories(categories) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.resolve(process.cwd(), './data/categories.json'), JSON.stringify(categories), (err) => {
            if (err) {
                reject();
            } else {
                console.log(JSON.stringify(categories));

                resolve();
            }
        });
    });
}

function addCrossHeaders(request, response) {
    let origin = '*';

    if (request.headers['origin']) {
        origin = request.headers['origin'];
    }

    if (request.headers['content-type']) {
        response.setHeader('Content-Type', request.headers['content-type']);
    }
    response.setHeader('Access-Control-Allow-Origin', request.headers['origin']);
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, PATCH, POST, DELETE');

    response.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Methods, Content-Type');
}

function respondToOptions(request, response) {

    addCrossHeaders(request, response);

    response.writeHead(200);
    response.end();
}

function getVenues(request, response) {


    // addCrossHeaders(request, response);

    loadData().then((data) => {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });

        let dataResp = [];

        data.response.groups[0].items.forEach(element => {
            let tempElement = {};
            tempElement.id = element.venue.id;
            tempElement.name = element.venue.name;
            tempElement.location = {
                'address': element.venue.location.country,
                'lat': element.venue.location.lat,
                'lng': element.venue.location.lng,
                'city': element.venue.location.city,
                'state': element.venue.location.state,
                'country': element.venue.location.country
            };

            element.venue.categories.forEach(element2 => {
                if (tempElement.categories) {
                    tempElement.categories.push(element2.id);

                } else {
                    tempElement.categories = [];
                    tempElement.categories.push(element2.id);

                }
            });
            dataResp.push(tempElement);
        });

        saveVenues(dataResp).then(() => {

        }).catch(() => {
            send404(request, response);
        });


        response.write(JSON.stringify(dataResp));
        response.end();

    }).catch(() => {
        send404(request, response);
    });
}

function getCategories(request, response) {
    loadData().then((data) => {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        let dataResp = [];


        // for (let index = 0; index < data.response.groups[0].items.length; index++) {
        //     dataResp[index] = data.response.groups[0].items[index];    
        // }

        data.response.groups[0].items.forEach(element => {
            element.venue.categories.forEach(element2 => {
                dataResp.push(element2);

            });
        });

        saveCategories(dataResp).then(() => {

        }).catch(() => {
            send404(request, response);
        });


        response.write(JSON.stringify(dataResp));
        response.end();

    }).catch(() => {
        send404(request, response);
    });
}

// function postCategorie(request, response) {
//     let buffer = [];
//     let categorie = null;

//     request.on('data', (chunk) => {
//         console.log(chunk);
//         buffer.push(chunk);

//     });

//     request.on('end', () => {
//         buffer = Buffer.concat(buffer).toString;
//         categorie = JSON.parse(buffer);
//     });
// }

// function postPost(request, response) {

//     addCrossHeaders(request, response);

//     let buffer = [];
//     let post = null;

//     request.on('data', (chunk) => {
//         console.log(chunk);
//         buffer.push(chunk);
//     });

//     request.on('end', () => {

//         buffer = Buffer.concat(buffer).toString();
//         post = JSON.parse(buffer);

//         loadPosts().then((posts) => {
//             posts[uniqid()] = post;
//             savePosts(posts).then(() => {
//                 console.log(posts);

//                 response.writeHead(200);
//                 response.end();
//             }).catch(() => {
//                 send404(request, response);
//             });
//         }).catch(() => {
//             send404(request, response);
//         });
//         console.log(buffer);
//     });
// }

// function updatePost(request, response) {

//     addCrossHeaders(request, response);

//     let buffer = [];
//     let post = null;

//     request.on('data', (chunk) => {
//         buffer.push(chunk);
//     });

//     request.on('end', () => {

//         buffer = Buffer.concat(buffer).toString();
//         post = JSON.parse(buffer);

//         loadPosts().then((posts) => {

//             for (const key in posts) {
//                 console.log(key);
//                 console.log(posts);


//                 for (const keyToUpdate in post) {
//                     if (key == keyToUpdate) {
//                         posts[key] = post[key];
//                     }
//                 }
//             }

//             savePosts(posts).then(() => {
//                 response.writeHead(200);
//                 response.end();
//             }).catch(() => {
//                 send404(request, response);
//             })
//         }).catch(() => {
//             send404(request, response);
//         });
//     });
// }

// function deletePost(request, response, key) {

//     addCrossHeaders(request, response);

//     loadPosts().then((posts) => {

//         delete posts[key];

//         savePosts(posts).then(() => {
//             response.writeHead(200);
//             response.end();
//         }).catch(() => {
//             send404(request, response);
//         });
//     }).catch(() => {
//         send404(request, response);
//     });
// }

function send404(request, response) {

    // addCrossHeaders(request, response);

    response.writeHead(404, {
        'Content-Type': 'applicacion/json'
    });
    response.end();
}