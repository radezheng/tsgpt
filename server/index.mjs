import express, { raw } from "express";
import axios from "axios";
import https from "https";
import path from 'path';
import sql from "mssql";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.NODE_PORT || 3000;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
};

// 让Express托管静态文件，这里假设Vue.js构建输出在'dist'目录中
// app.use(express.static(path.join(__dirname, 'dist')));


app.use(express.json());
const apiUrl =
  "https://"+ process.env.VUE_APP_APIM_HOST + "/chat/completions?api-version=2023-05-15";

const apiKey = process.env.VUE_APP_APIM_KEY;

let msgid = 0;
// List apps
app.get("/api/gptapps/list", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM tblGPTApps`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching app list," + err.originalError);
  }
});

// Add a new app
app.post("/api/gptapps/add", async (req, res) => {
  const { name, description, dataground, temperature, max_tokens, top_p,  welcome } = req.body;

  try {
    await sql.connect(config);
    await sql.query`INSERT INTO tblGPTApps (name, description, dataground, temperature, max_tokens, top_p, welcome) VALUES (${name},${description}, ${dataground}, ${temperature}, ${max_tokens}, ${top_p},  ${welcome})`;
    res.status(201).send("App added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding app");
  }
});

app.get("/api/gptapps/:appName", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM tblGPTApps where name = ${req.params.appName}`;
    if(result.recordset.length > 0) {
    res.json(result.recordset);
    } else {
      res.status(404).send("App not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching app list");
  }
});


// Delete an app
app.delete("/api/gptapps/delete/:id", async (req, res) => {
  const appId = req.params.id;

  try {
    await sql.connect(config);
    await sql.query`DELETE FROM tblGPTApps WHERE app_id = ${appId}`;
    res.send("App deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting app");
  }
});

app.post("/api/chat/completions", async (req, res) => {
  try {
    const response = await axios.post(apiUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/chat/completions/stream", (req, res) => {
  // console.log("req->", req.body);
  const requestBody = JSON.stringify(req.body);
  const proxyReq = https.request(
    {
      method: "POST",
      hostname: process.env.VUE_APP_APIM_HOST,
      path:
        "/chat/completions?api-version=2023-05-15",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "MsgId": msgid++,
      },
    },
    (proxyRes) => {
      let rawData = "";

      proxyRes.on("error", (error) => {
        console.error("Error with the request:", error.message);
        res.statusCode = 500;
        res.end("Error with the request",error.message);
      });
      proxyRes.on("data", (chunk) => {
        // console.log("chunk->", chunk);
        res.write(chunk);
        rawData += chunk;
      });

      proxyRes.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          // console.log("Parsed data:", rawData);
        //   res.writeHead(proxyRes.statusCode, proxyRes.headers);
          res.statusCode = proxyRes.statusCode;
        
          if(rawData.length > 0) {
            if(rawData.indexOf("error") > -1) {
                // console.log(parsedData.error);
                res.statusCode = 500;
            }
            // res.write(rawData);
          }
          res.end(); // Send the parsed data as a response to the client-side
        } catch (error) {
          console.error("Error parsing the response:", error.message);
          res.statusCode = 500;
          res.end("Error parsing the response");
        }
      });
    }
  );

  proxyReq.write(requestBody);
  proxyReq.end();
  // req.pipe(proxyReq, { end: true });
});

// 对于任何其他请求，均返回Vue.js的index.html文件
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  
app.listen(port, () => {
  console.log(`ChatGPT proxy server is running at http://localhost:${port}`);
});
