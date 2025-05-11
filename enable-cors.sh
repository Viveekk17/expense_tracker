#!/bin/bash

API_ID="i6nn3gptzh"
STAGE="dev"

# Enable CORS for all resources
aws apigateway update-resource --rest-api-id $API_ID --resource-id "cfmmmn" --patch-operations op=replace,path=/resourceMethods/OPTIONS,value="{}"

# Add CORS headers to OPTIONS method
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id "cfmmmn" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{
    \"method.response.header.Access-Control-Allow-Headers\": true,
    \"method.response.header.Access-Control-Allow-Methods\": true,
    \"method.response.header.Access-Control-Allow-Origin\": true
  }"

# Add integration response for OPTIONS
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id "cfmmmn" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{
    \"method.response.header.Access-Control-Allow-Headers\": \"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",
    \"method.response.header.Access-Control-Allow-Methods\": \"'GET,PUT,POST,DELETE,OPTIONS'\",
    \"method.response.header.Access-Control-Allow-Origin\": \"'*'\"
  }"

# Deploy the API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE 