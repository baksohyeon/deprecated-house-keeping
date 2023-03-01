FROM node:16-alpine As development

# Create app directory
WORKDIR /usr/src/app


# Copy application dependency manifests to the container image.
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package.json ./
COPY yarn.lock ./

RUN yarn install --immutable --immutable-cache --check-cache


COPY . .

RUN yarn build

EXPOSE 3001
CMD ["yarn", "start:prod"]

