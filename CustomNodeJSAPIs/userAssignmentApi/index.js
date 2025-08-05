"use strict";
const express = require('express');
//const cors = require ('cors');
var Readable = require('stream').Readable;
const bodyParser = require("body-parser");
//const dotenv = require('dotenv');
//const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.json())
var hana = require("@sap/hana-client");
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
const axios = require('axios');
const qs = require('qs');
 
const clientId = 'sb-5a4cc893-075b-4847-aa0c-64ac8e5341eb!b5357|dmc-services-quality!b330';
const clientSecret = 'h6fLBaZ8fs1PScAUhpMTlQoG0+8=';
const tokenUrl = 'https://ritsdmc-az12fc9w.authentication.eu20.hana.ondemand.com/oauth/token';
const dmcBaseUrl = 'https://api.test.eu20.dmc.cloud.sap';
 
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin,x-csrf-token, X-Requested-With,x-dme-plant,x-dme-industry-type,x-features,X-Sap-Cid, contentType,Content-Type, Accept, Authorization");
    next();
});
 
module.exports = app;
var dapConnOptions = {
    serverNode: "eae12fa4-f9ac-46df-99fc-533854490873.hana.trial-us10.hanacloud.ondemand.com:443",
    encrypt: "true",
    sslValidateCertificate: "false",
    uid: "DBADMIN",
    pwd: "Rits@123",
};

app.get('/api/get/userDetails', async function (req, res)
{
    var dbConnection = hana.createConnection();
    console.log("DB Connection Object : " + dbConnection);
    console.log(dbConnection);
    dbConnection.connect(dapConnOptions, function (err) {
      if (err) throw err;
      dbConnection.exec(
        "select * from  DBADMIN.Z_USERGROUP",
        function (err, result)
        {
          if (err) throw err;
          console.log(result);
          res.send(result);
          dbConnection.disconnect();
        }
      );
    });
});


app.post('/api/insert/userDetails', async function (req, res) {
  console.log("Inside /api/insert/userDetails POST method");
  console.log("Request Body: ", req.body);

  const userId = req.body.USERID;
  const description = req.body.DESCRIPTION;
  const personalId = req.body.PERSONALID;

  // Validate required fields
  if (!userId || !description || !personalId) {
    return res.status(400).send("All fields (USERID, DESCRIPTION, PERSONALID) are required and must not be empty.");
  }

  const dbConnection = hana.createConnection();

  dbConnection.connect(dapConnOptions, function (err) {
    if (err) {
      console.error("DB Connection Error:", err);
      return res.status(500).send("Database connection failed");
    }

    const checkQuery = `SELECT "USERID" FROM "DBADMIN"."Z_USERGROUP" WHERE "USERID" = ?`;

    dbConnection.exec(checkQuery, [userId], function (err, result) {
      if (err) {
        console.error("Error executing check query:", err);
        res.status(500).send("Failed to check existing user");
        dbConnection.disconnect();
        return;
      }

      if (result.length > 0) {
        // Update existing user
        const updateQuery = `
          UPDATE "DBADMIN"."Z_USERGROUP"
          SET "DESCRIPTION" = ?, "PERSONALID" = ?
          WHERE "USERID" = ?
        `;

        dbConnection.exec(updateQuery, [description, personalId, userId], function (err, updateResult) {
          if (err) {
            console.error("Error executing update query:", err);
            res.status(500).send("Failed to update user");
          } else {
            console.log(userId + " - User details updated successfully");
            res.send(userId + " - User details updated successfully");
          }
          dbConnection.disconnect();
        });
      } else {
        // Insert new user
        const insertQuery = `
          INSERT INTO "DBADMIN"."Z_USERGROUP"
          ("USERID", "DESCRIPTION", "PERSONALID") 
          VALUES (?, ?, ?)
        `;

        dbConnection.exec(insertQuery, [userId, description, personalId], function (err, insertResult) {
          if (err) {
            console.error("Error executing insert query:", err);
            res.status(500).send("Failed to insert user");
          } else {
            console.log(userId + " - User details inserted successfully");
            res.send(userId + " - User details inserted successfully");
          }
          dbConnection.disconnect();
        });
      }
    });
  });
});



app.delete('/api/delete/userDetails', async function (req, res) {
  console.log("Inside /api/delete/userDetails DELETE method");

  // Get USERID from body or query parameter
  const userId = req.body.USERID || req.query.userId;

  if (!userId) {
    return res.status(400).send("USERID is required in request body or query parameter");
  }

  const dbConnection = hana.createConnection();

  dbConnection.connect(dapConnOptions, function (err) {
    if (err) {
      console.error("DB Connection Error:", err);
      return res.status(500).send("Database connection failed");
    }

    const checkQuery = `SELECT "USERID" FROM "DBADMIN"."Z_USERGROUP" WHERE "USERID" = ?`;

    dbConnection.exec(checkQuery, [userId], function (err, result) {
      if (err) {
        console.error("Error executing check query:", err);
        res.status(500).send("Failed to check existing user");
        dbConnection.disconnect();
        return;
      }

      if (result.length === 0) {
        console.warn("User not found: " + userId);
        res.status(404).send("User not found: " + userId);
        dbConnection.disconnect();
        return;
      }

      const deleteQuery = `DELETE FROM "DBADMIN"."Z_USERGROUP" WHERE "USERID" = ?`;

      dbConnection.exec(deleteQuery, [userId], function (err, deleteResult) {
        if (err) {
          console.error("Error executing delete query:", err);
          res.status(500).send("Failed to delete user");
        } else {
          console.log(userId + " - User deleted successfully");
          res.send(userId + " - User deleted successfully");
        }
        dbConnection.disconnect();
      });
    });
  });
});
