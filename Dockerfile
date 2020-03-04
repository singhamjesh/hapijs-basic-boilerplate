# install node 10 version
FROM alpine:latest
# FROM node:10

# use cache for next time run
RUN apk add --no-cache nodejs npm

# Create app directory
WORKDIR /usr/src/app

# Set NODE_ENV 
ENV NODE_ENV development

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Expose on 9000 port
EXPOSE 9000

# Use for run module
ENTRYPOINT [ "node" ]

# Run server file
CMD [ "server.js" ]
