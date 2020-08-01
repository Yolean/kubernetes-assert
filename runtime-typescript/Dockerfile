FROM yolean/assert-runtime-nodejs

RUN npm install --ignore-scripts typescript@3.9.7 ts-jest@26.1.4

RUN sed -i "s/preset: undefined/preset: 'ts-jest'/" /usr/src/jest.config.js
