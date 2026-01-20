FROM oven/bun:1.2.9

WORKDIR /app

# copy host -> container /app
COPY . .

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

# copy all code, after installing dependencies
COPY . .

# expose port for container
EXPOSE 9400

CMD ["bun", "run", "start"]