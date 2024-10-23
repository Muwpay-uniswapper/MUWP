# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM --platform=linux/amd64 oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY . /temp/dev/
RUN cd /temp/dev && bun install

# [optional] tests & build
ENV NODE_ENV=production
# RUN cd /temp/dev && bun test
RUN cd /temp/dev && bun build backend/index.ts --target=bun --outfile=index.js --sourcemap=inline

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/dev/index.js ./

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
