# Auth

Create your own authentication api with this boilerplate.

## Deployment

Clone this reposistory

### Deploy global table

Update `table-production.yaml` with desired regions. Use `table-development.yaml` for development.

**Configuration**

| Parameter | Required | Description | Example/Default |
| --- | --- | --- | --- |
| TableName | Yes | Name of the Dynamodb table | bot41-auth-table |

**Command**

```
sam build -t table-production.yaml && sam deploy \
  --stack-name bot41-auth-table \
  --capabilities CAPABILITY_IAM \
  --s3-bucket bot41-us-east-1 \
  --s3-prefix auth-table \
  --region us-east-1 \
  --profile feedme \
  --parameter-overrides ParameterKey=TableName,ParameterValue=bot41-auth-table
```

### Deploy auth api

1. Run `pnpm install`
2. Run `pnpm esbuild`

**Configuration**

| Parameter | Required | Description | Example/Default |
| --- | --- | --- | --- |
| EnvType | No | Either production or development | development |
| TableName | Yes | Name of the Dynamodb table | bot41-auth-table |
| AppUrl | Yes | Url of the app that is using this auth api. (CORS) | https://app.example.com |
| AuthUrl | Yes | Url of where this api is deployed to. (Cookie) | api.example.com |
| GoogleClientId | (Yes) | Required when you expect clients to login with type="google" | |
| GoogleClientSecret | (Yes) | Required when you expect clients to login with type="google" | |
| CookieName | No | Name of the cookie | r_id |
| CookieExpiresIn | No | Expiration time of the cookie | 315360000 (10 years) |
| TokenExpiresIn | No | Expiration time of the access token | 15m (15 minutes; https://github.com/vercel/ms) |
| AuthorizerName | Yes | Name of the exported authorizer function | bot41-auth-api-dev-authorizer |
| RegionalCertificateArn | Yes in production | Arn of the certificate for the custom domain (api.example.com) |  |

**Development**

```
sam build && sam deploy \
  --stack-name bot41-auth-api-dev \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --region eu-central-1 \
  --profile feedme \
  --s3-bucket bot41-eu-central-1 \
  --s3-prefix auth-api-dev \
  --parameter-overrides ParameterKey=AppUrl,ParameterValue=http://localhost:3000 ParameterKey=AuthUrl,ParameterValue=api.bot41.com ParameterKey=GoogleClientId,ParameterValue=xxx.apps.googleusercontent.com ParameterKey=GoogleClientSecret,ParameterValue=xxx ParameterKey=AuthorizerName,ParameterValue=bot41-auth-api-dev-authorizer ParameterKey=TableName,ParameterValue=bot41-auth-table-dev
```

**Production**

```
sam build && sam deploy \
  --stack-name bot41-auth-api \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --region eu-central-1 \
  --profile feedme \
  --s3-bucket bot41-eu-central-1 \
  --s3-prefix auth-api \
  --parameter-overrides ParameterKey=AppUrl,ParameterValue=https://app.bot41.com ParameterKey=AuthUrl,ParameterValue=api.bot41.com ParameterKey=EnvType,ParameterValue=production ParameterKey=GoogleClientId,ParameterValue=xxx.apps.googleusercontent.com ParameterKey=GoogleClientSecret,ParameterValue=xxx ParameterKey=AuthorizerName,ParameterValue=bot41-auth-api-authorizer  ParameterKey=TableName,ParameterValue=bot41-auth-table ParameterKey=RegionalCertificateArn,ParameterValue=arn:aws:acm:eu-central-1:xxx:certificate/xxx
```

## Integration

### Backend

The contents of the access token is described as:

```typescript
type AccessToken = {
    type: "user";
    userId: string;
    name: string;
    picture?: string | undefined;
} | {
    createdAt: number;
    type: "client";
    name: string;
    clientId: string;
}
```

The entity object is stored in the authorizer context:

```typescript
event.requestContext.authorizer.entity
```

A helper function for backend endpoints could look like this:

```typescript
import { APIGatewayProxyEvent } from "aws-lambda";
import * as z from "zod";

const userAccessTokenSchema = z.object({
  userId: z.string(),
  name: z.string(),
  picture: z.string().optional(),
  type: z.literal("user"),
});
const clientAccessTokenSchema = z.object({
  name: z.string(),
  clientId: z.string(),
  createdAt: z.number(),
  type: z.literal("client"),
});
const accessTokenSchema = z.union([
  userAccessTokenSchema,
  clientAccessTokenSchema,
]);

const getEntity = (event: APIGatewayProxyEvent) => {
  const entity = accessTokenSchema
    .parse(JSON.parse(event.requestContext.authorizer?.["entity"] as string));
  return entity;
}
```