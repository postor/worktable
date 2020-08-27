FROM node:lts-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache inotify-tools
# Env
# ENV NODE_ENV=production
# Create Directory for the Container
WORKDIR /usr/src/app
# Only copy the package.json file to work directory
COPY package.json .

# Install all Packages
RUN npm install

# Copy all other source code to work directory
ADD . /usr/src/app

RUN npm run build
RUN npm run build:web

#runs the script
# ENTRYPOINT ["sh","-c","./start.sh"]
# Start
CMD ["sh","-c","npm run start"]
