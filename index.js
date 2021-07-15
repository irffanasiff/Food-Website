const fs = require("fs");
const http = require("http");
const url = require("url");
// const slugify = require('slugify');
// const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written!');

// Non-blocking, asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('ERROR! 💥');

//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//         console.log('Your file has been written 😁');
//       })
//     });
//   });
// });
// console.log('Will read file!');

/////////////////////////////////
// SERVER

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName); //replace template function will replace all the templates with names, image etc from product array
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  return output;
};

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`,"utf-8");
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`,"utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`,"utf-8");

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8"); //get data from data.json
const dataObj = JSON.parse(data); //parse the data and will display as a object 


//Async code starts here
const server = http.createServer((req, res) => {
  const {query, pathname} = url.parse(req.url, true);
  

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {"Content-type": "text/html",});
    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join(""); //on every object inside data.json we use replaceTemplate function
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === "/product") {
    res.writeHead(200, {"Content-type": "text/html",});
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product)
    res.end(output)

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});


server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port http://localhost:8000");
});
