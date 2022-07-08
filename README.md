# Chatingale

Chatingale is a realtime Chat app that use React as front end, Node.js as the backend and Socket-IO for bi-directional communication between React and Node-js.

After entering the name users are directly connected to a room where multiple users can
join and chat simultaneously

## Steps to run the project

Open terminal and navigate to the 'Client' directory and server it.
```
cd .\Client\
npm start
```

Open a new terminal and navigate to the 'Server' directory and server it.
```
cd .\Server\
npm start
```

# Done ✅


## Steps for Hosting the project

Create the build of the client 
```
cd .\Client\
npm run build
```

Copy the build folder created inside the Client and paste it inside the Server directory
```
Server
  |__ build ⬅️
  |__ index.js
  |__ package.json
  |__ . . . 
```

Now copy the Server directory and place inside the hosting server 

# Done ✅

