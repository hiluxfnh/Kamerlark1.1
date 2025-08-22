// This script creates a build for Firebase Hosting
const fs = require("fs");

// Make sure the out directory exists
if (!fs.existsSync("./out")) {
  fs.mkdirSync("./out", { recursive: true });
}

// Create a simple Firebase Hosting rewrite configuration
const rewrites = `
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
`;

// Write the configuration to the firebase.json file
fs.writeFileSync("./firebase.json", rewrites);

console.log("Firebase Hosting configuration created!");
