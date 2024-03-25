# Cloudant Restore Service

This service is designed to restore one or multiple Cloudant databases from a Cloud Object Storage (COS) bucket on IBM Cloud.

## Prerequisites

- [PNPM](https://pnpm.io/installation)
- [Node v18](https://nodejs.org/en/download/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

The service is configured using environment variables.

Please refer to the [`.env.example`](.env.example) file for the list of environment variables that need to be set.

## Installing dependencies

To install the dependencies, you can use the following command:

```bash
pnpm install
```

## Running the service

⚠️ Please note that you need to set the required environment variables before running the service.

To run the service, you can use the following command:

```bash
pnpm start
```

## Running the service in development mode

To run the service in development mode, you can use the following command:

```bash
pnpm start:dev
```

## Running the service using Docker

To run the service using Docker, you can use the following command:

```bash
./containerizer dev build && ./containerizer dev up
```

Optionally, you can use the following command to run the service using Docker in production mode:

```bash
./containerizer prod build && ./containerizer prod up
```

## API

The service exposes the following endpoints:

### `POST /db/restore`

Restore one or multiple Cloudant databases from a Cloud Object Storage (COS) bucket on IBM Cloud.

#### Request

`databases` (**required**) - An array of strings, where each string represents the name of a database to be restored.

Example request body:

```json
{
  "databases": [
	"db1",
	"db2",
	"db3"
  ]
}
```

#### Response

`200 OK` - The restoration of all the specified databases was successful. The response body contains a message indicating the completion of the restoration. Example: "Restore of db1, db2 complete".

`500 Interal Server Error` - One or more databases fail to restore. The response body contains a message indicating the failure to restore these databases. Example: "Error restoring db3".

#### Errors

In the event of a error during the restoration process, the error is logged for debugging purposes.

### `\api-docs`

This endpoint serves up the Swagger-based API documentation. Swagger is a powerful tool for designing APIs. It provides several benefits including:

#### Interactive Documentation

Interactive documentation allows developers and non-developers to interact with your API in the browser. They can perform HTTP requests to your API endpoints and observe the responses in real-time. In your service, you've integrated Swagger's interactive documentation at the `/api-docs` route. This means anyone can navigate to that route (i.e., `http://<your-service-url>/api-docs`) and start interacting with the API.

#### Structure

Swagger helps in designing structured APIs. It uses a common language to define APIs, making them understandable by humans and machines. It standardizes the way APIs are designed, which helps to maintain consistency across different APIs.

#### Integration and Usage

Swagger is integrated with modern programming languages and frameworks, which enhances its flexibilities. It can be used at various stages of an API lifecycle including design, building, testing, and documentation.

In your service, you can update the [`swagger.yml`](swagger.yml) file to define the structure of your API endpoints, including request bodies, response bodies, status codes, and other metadata. When your service starts, the Swagger documentation is generated automatically based on your `swagger.yml` file. The `swagger-ui-express` middleware serves this documentation at the route you've specified (`/api-docs` in this case).

#### Limitations

While the Swagger API documentation tooling provides numerous benefits, it's important to note that it does not replace comprehensive API documentation. It is useful primarily for detailing route specifics, request/response formats, and giving high-level overviews. More detailed documentation regarding the background, version changelogs, rate limits, usage examples, etc., is often necessary and won't be covered by Swagger.