#!/bin/bash
set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
ECR_REPO=pcluster-manager-awslambda

pushd frontend
if [ ! -d node_modules ]; then
  npm install
fi
docker build --build-arg PUBLIC_URL=. -t frontend-awslambda .
popd
docker build -f Dockerfile.awslambda -t ${ECR_REPO} .

# These upload the container to the public repo
ECR_ENDPOINT="public.ecr.aws/n0x0o5k1"
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"
docker tag ${ECR_REPO}:latest ${ECR_ENDPOINT}/${ECR_REPO}:latest
docker push ${ECR_ENDPOINT}/${ECR_REPO}:latest

#aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n0x0o5k1
#docker tag pcluster-manager:latest public.ecr.aws/n0x0o5k1/pcluster-manager:latest
#docker push public.ecr.aws/n0x0o5k1/pcluster-manager:latest
