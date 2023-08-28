# Casinha

This is developed using Node.js with
 the Express framework and MongoDB database

## Features
- **Secure Authentication**
- **Home Page with Posts**
- **Post Creation**
- **Comments**
- **Social Interactions**
- **User Profiles**
- **Custom Settings**

## Technologies Used
- **Node.js**
- **Express**
- **Passport and express-local:**
- **MongoDB**

## Installation and Configuration
Follow the steps below to install and configure the project on your machine:

1. **Install dependencies:** Navigate to the project directory and install the Node.js dependencies
```sh
npm install
```

2. **Configure MongoDB:** Make sure you have MongoDB installed and running.
 You want to have a collection named `users` and `posts`

3. **Configure the .env file:** There is a file named `.env-template` and add the following information,
 replacing with the appropriate values and rename it to `.env`:
```
PORT=port # Port you want the application to run
DB_URI=your-mongodb-connection-link
SESSION_SECRET=your-secret-key-to-express-session
ARGON2_SECRET=your-secret-key-to-hash-passwords

# PS: secret is just a long string, use a site to generate one
```

4. **Run the project:** After all that you can start the project
```sh
npm run dev # run with daemon
```

The project is now running locally.<br>
You can access it in your browser via the address http://localhost:port_you_chose_on_env_file