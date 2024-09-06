# mini-blog-app
Mini Blog App is a simple blogging platform built with Express.js. This project provides essential functionalities for user authentication, blog creation, and blog management.

# node version
20.13.0

# Install dependencies
npm install

# Set the config file from config folder (database name, password of your database)

# Run migrations using following command
npx sequelize-cli db:migrate

# Run seeder using following command
npx sequelize-cli db:seed:all

# Generate .env file and add your configuration for example .env.sample
npm start

# For update blog
# Only an admin can update the status; otherwise, non-admin users can only update the blog details.

# for get blogs API
# Admins:
Can view all blogs.
Can filter by status (Pending, Approved, Cancelled).
Can filter by userId if provided.

# Non-admin Users with myBlogs=true:
Can view their own blogs (where author matches req.user.id).
Can filter by status.

# Non-admin Users without myBlogs=true:
Can only view approved blogs.
Can filter by userId if provided (for example, if userId is given, show approved blogs from that user).