const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { Product, FeedBuilder, ProductPrice } = require('node-product-catalog-feed');



const app = express();
const PORT = 3000;

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  

app.use(bodyParser.json());

const FEED_FOLDER = 'feed-files';

// Create feed-files directory if not exists
if (!fs.existsSync(FEED_FOLDER)) {
  fs.mkdirSync(FEED_FOLDER);
}

// Endpoint to create or update a product in a store
app.post('/createOrUpdateProduct', (req, res) => {
  const { store_id, name, title, price, actual_price } = req.body;

  if (!store_id || !name || !title || !price || !actual_price) {
    return res.status(400).json({ error: 'Incomplete product information' });
  }

  const storeFilePath = path.join(FEED_FOLDER, `${store_id}.json`);

  let storeData = [];
  if (fs.existsSync(storeFilePath)) {
    // If the store file exists, read its content
    const storeContent = fs.readFileSync(storeFilePath, 'utf8');
    storeData = JSON.parse(storeContent);
  }

  // Check if the product already exists
  const existingProductIndex = storeData.findIndex((product) => product.name === name);

  if (existingProductIndex !== -1) {
    // If the product already exists, update its information
    storeData[existingProductIndex] = { name, title, price, actual_price };
  } else {
    // If the product doesn't exist, add a new product
    storeData.push({ name, title, price, actual_price });
  }

  // Write the updated data back to the store file
  fs.writeFileSync(storeFilePath, JSON.stringify(storeData, null, 2));

  res.status(200).json({ message: 'Product added/updated successfully' });
});

// Endpoint to delete a product from a store
app.delete('/deleteProduct', (req, res) => {
  const { store_id, name } = req.body;

  if (!store_id || !name) {
    return res.status(400).json({ error: 'Incomplete information for product deletion' });
  }

  const storeFilePath = path.join(FEED_FOLDER, `${store_id}.json`);

  if (!fs.existsSync(storeFilePath)) {
    return res.status(404).json({ error: 'Store not found' });
  }

  // Read the current store data
  const storeContent = fs.readFileSync(storeFilePath, 'utf8');
  let storeData = JSON.parse(storeContent);

  // Find and remove the product from the store
  const updatedStoreData = storeData.filter((product) => product.name !== name);

  // Write the updated data back to the store file
  fs.writeFileSync(storeFilePath, JSON.stringify(updatedStoreData, null, 2));

  res.status(200).json({ message: 'Product deleted successfully' });
});

app.get('/list', (req, res) => {

    console.log("requested")
    const store_id = req.query.store_id;
  
    if (!store_id) {
      return res.status(400).json({ error: 'Missing store_id parameter' });
    }
  
    const storeFilePath = path.join(FEED_FOLDER, `${store_id}.json`);
  
    if (!fs.existsSync(storeFilePath)) {
      return res.status(200).json({ error: 'Store not found' });
    }
  
    // Read the store data and send it as the response
    const storeContent = fs.readFileSync(storeFilePath, 'utf8');
    const storeData = JSON.parse(storeContent);
  
    res.status(200).json({ store_id, products: storeData });
  });

  app.get('/generateXml/:store_id', (req, res) => {
    const { store_id } = req.params;
  
    if (!store_id) {
      return res.status(400).json({ error: 'Missing store_id parameter' });
    }
  
    const storeFilePath = path.join(FEED_FOLDER, `${store_id}.json`);
  
    if (!fs.existsSync(storeFilePath)) {
      return res.status(404).json({ error: 'Store not found' });
    }
  
    // Read the store data
    const storeContent = fs.readFileSync(storeFilePath, 'utf8');
    const storeData = JSON.parse(storeContent);
  
    // Create a new FeedBuilder
    const feedBuilder = new FeedBuilder()
      .withTitle('Your Product Feed Title')
      .withLink('https://your-link.com')
      .withDescription('Your Feed Description');
  
    // Add each product to the feed builder
    storeData.products.forEach((product) => {
    //   const pricing = new ProductPrice(product.price, 'USD');
             new ProductPrice(product.price, 'USD');
  
      const feedProduct = new Product()
      feedProduct.title = product.name;   
      feedProduct.description=product.description
      feedBuilder.imageLink= product.imageLink
      feedBuilder.price =   new ProductPrice(product.price, 'USD');

        // .withId(product.id)
        // .withTitle(product.title)
        // .withDescription(product.description)
        // .withLink(`${product.link}`)
        // .withImageLink(product.imageLink)
        // .withCondition(product.condition)
        // .withPrice(pricing)
        // .withSalePrice(salePrice)
        // .withAvailability(product.availability)
        // .withItemGroupId(product.itemGroupId);
  
      feedBuilder.withProduct(feedProduct);
    });
  
    // Build XML
    const xmlData = feedBuilder.buildXml();
  
    // Set content type and send XML as the response
    res.set('Content-Type', 'text/xml');
    res.status(200).send(xmlData);
  });

  app.get('/generateProducts', (req, res) => {
    const numberOfProducts = 10000;
    const products = [];

    const name = generateRandomString()
  
    for (let i = 0; i < numberOfProducts; i++) {
      const product = {
        id: "name",
        name:"name",
        description: "name",
        price: 23.4,
        imageLink:name,
        // Add other properties as needed
      };
  
      products.push(product);
    }
  
    res.status(200).json(products);
  });

  
app.get('/generateProducts/:store_id', (req, res) => {
    const { store_id } = req.params;
    const numberOfProducts = 100000;
    const products = [];

  
    for (let i = 0; i < numberOfProducts; i++) {
        const product = {
            id: "name",
            name:"name",
            description: "name",
            price: 23.4,
            imageLink:"name",
            // Add other properties as needed
          };
  
      products.push(product);
    }
  
    const storeFilePath = path.join('feed-files', `${store_id}.json`);
  
    if (!fs.existsSync(storeFilePath)) {
      fs.writeFileSync(storeFilePath, JSON.stringify({ products }, null, 2));
    } else {
      // If the store file already exists, append the new products
      const existingStoreData = JSON.parse(fs.readFileSync(storeFilePath, 'utf8'));
      existingStoreData.products.push(...products);
      fs.writeFileSync(storeFilePath, JSON.stringify(existingStoreData, null, 2));
    }
  
    res.status(200).json({ message: 'Products generated and stored successfully' });
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
