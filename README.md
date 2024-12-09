## Installation and Setup
### Prerequisites
Ensure you have Node.js and PostgreSQL installed.
### Clone the repository
``` bash
git clone https://github.com/Sadika-Hussain/express-biztime.git
cd express-biztime
```
### Install Dependencies
``` bash
npm install
```
### Database Setup
#### Create the database and tables:
``` bash
createdb biztime
psql < data.sql
```
### Start the Server
#### Run the development server:
``` bash
node server.js
```