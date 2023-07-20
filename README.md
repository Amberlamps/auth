# Auth

Create your own authentication api with this boilerplate.

## Configuration

| Parameter | Required | Description | Example/Default |
| --- | --- | --- | --- |
| AppUrl | Yes | Url of the app that is using this auth api. (CORS) | https://app.example.com |
| AuthUrl | Yes | Url of where this api is deployed to. (Cookie) | api.example.com |
| CookieName | No | Name of the cookie | r_id |
| CookieExpires | No | Expiration time of the cookie | 315360000 (10 years) |

## Deployment

1. Clone this repository
2. Run `pnpm install`
3. Run `pnpm esbuild`
4. Deploy api to AWS with AWS SAM:

```
sam deploy \
  --stack-name my-auth-api \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --region eu-central-1 \
  --profile my-profil
  --s3-bucket my-application-bucket \
  --s3-prefix my-auth-api \
  --parameter-overrides ParameterKey=AppUrl,ParameterValue=https://app.example.com ParameterKey=AuthUrl,ParameterValue=api.example.com
```