# Auth

Create your own authentication api with this boilerplate.

## Configuration

| Parameter | Required | Description | Example/Default |
| --- | --- | --- | --- |
| AppUrl | Yes | Url of the app that is using this auth api. (CORS) | https://app.example.com |
| AuthUrl | Yes | Url of where this api is deployed to. (Cookie) | api.example.com |
| GoogleClientId | (Yes) | Required when you expect clients to login with type="google" | |
| GoogleClientSecret | (Yes) | Required when you expect clients to login with type="google" | |
| CookieName | No | Name of the cookie | r_id |
| CookieExpiresIn | No | Expiration time of the cookie | 315360000 (10 years) |
| TokenExpiresIn | No | Expiration time of the access token | 15m (15 minutes; https://github.com/vercel/ms) |

## Deployment

1. Clone this repository
2. Run `pnpm install`
3. Run `pnpm esbuild`
4. Run `sam build`
5. Deploy api to AWS with AWS SAM:

**Development**

```
sam deploy \
  --stack-name bot41-auth-api-dev \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --region eu-central-1 \
  --profile feedme \
  --s3-bucket bot41-eu-central-1 \
  --s3-prefix auth-api-dev \
  --parameter-overrides ParameterKey=AppUrl,ParameterValue=http://localhost:3000 ParameterKey=AuthUrl,ParameterValue=api.bot41.com ParameterKey=GoogleClientId,ParameterValue=xxx.apps.googleusercontent.com ParameterKey=GoogleClientSecret,ParameterValue=xxx
```

** Production **

```
sam deploy \
  --stack-name bot41-auth-api \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --region eu-central-1 \
  --profile feedme \
  --s3-bucket bot41-eu-central-1 \
  --s3-prefix auth-api \
  --parameter-overrides ParameterKey=AppUrl,ParameterValue=https://bot41.com ParameterKey=AuthUrl,ParameterValue=api.bot41.com
```
